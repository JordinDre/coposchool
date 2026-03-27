<?php

namespace App\Console\Commands;

use App\Jobs\InitializeTenantData;
use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateTenant extends Command
{
    protected $signature = 'tenant:create 
                            {id : El ID único del tenant (ej: demo, cliente1, etc)}
                            {--seed : Ejecutar seeders después de las migraciones}
                            {--fresh : Eliminar y recrear el tenant si ya existe}';

    protected $description = 'Crea un nuevo tenant con su BD, dominio y migraciones';

    public function handle(): int
    {
        $tenantId = $this->argument('id');

        $this->info("🚀 Creando tenant: {$tenantId}");
        $this->newLine();

        // Asegurar que la tabla activity_log existe en MySQL
        $this->ensureActivityLogTableExists();

        // Verificar si el tenant ya existe
        $existingTenant = Tenant::find($tenantId);

        if ($existingTenant) {
            if ($this->option('fresh')) {
                $this->warn("⚠️  Tenant '{$tenantId}' ya existe. Eliminando...");

                try {
                    $existingTenant->delete();
                    $this->info('✅ Tenant eliminado');
                } catch (\Exception $e) {
                    // Si falla al eliminar (por ejemplo, la BD no existe),
                    // eliminar manualmente el registro de la tabla tenants
                    if (str_contains($e->getMessage(), "database doesn't exist") ||
                        str_contains($e->getMessage(), "Can't drop database")) {
                        $this->warn('⚠️  La base de datos del tenant no existe, eliminando solo el registro...');
                        $connection = config('tenancy.database.central_connection');
                        if (! $connection || ! config("database.connections.{$connection}")) {
                            $connection = 'mysql';
                        }
                        DB::connection($connection)->table('tenants')->where('id', $tenantId)->delete();
                        DB::connection($connection)->table('domains')->where('tenant_id', $tenantId)->delete();
                        $this->info('✅ Registro del tenant eliminado');
                    } else {
                        throw $e;
                    }
                }
            } else {
                $this->error("❌ El tenant '{$tenantId}' ya existe.");
                $this->info("💡 Usa --fresh para recrearlo: php artisan tenant:create {$tenantId} --fresh");

                return Command::FAILURE;
            }
        }

        // Crear tenant
        $this->info('📦 Creando tenant...');
        $tenant = Tenant::create([
            'id' => $tenantId,
        ]);
        $this->info('✅ Tenant creado');

        // Determinar dominio según el entorno
        $domain = $this->getDomain($tenantId);

        // Crear dominio
        $this->info('🌐 Creando dominio...');
        $tenant->domains()->create([
            'domain' => $domain,
        ]);
        $this->info("✅ Dominio creado: {$domain}");

        // Nota: Las migraciones se ejecutan automáticamente por el evento TenantCreated
        $this->info('📊 Base de datos y migraciones ejecutándose...');
        $this->newLine();
        $this->info('✅ Base de datos creada y migraciones completadas');

        // Ejecutar seeders si se especificó
        if ($this->option('seed')) {
            $this->info('🌱 Ejecutando seeders...');
            $this->newLine();

            // El --force ya está configurado en config/tenancy.php
            Artisan::call('tenants:seed', [
                '--tenants' => [$tenantId],
            ], $this->output);

            $this->newLine();
            $this->info('✅ Seeders completados');
        }

        // Inicializar datos del tenant (bodega, cajas fondo, usuario admin, configuración)
        // Esto se ejecuta siempre después de las migraciones (y seeders si se especificaron)
        // Asegurar que el contexto del tenant esté activo antes de ejecutar el Job
        $this->info('⚙️  Inicializando datos del tenant...');
        $this->newLine();

        try {
            // Asegurar que el tenant esté inicializado en el contexto
            tenancy()->initialize($tenant);

            $job = new InitializeTenantData($tenant);
            $job->handle();

            // Finalizar el contexto del tenant
            tenancy()->end();

            $this->info('✅ Datos del tenant inicializados');
            $this->newLine();
        } catch (\Exception $e) {
            // Asegurarse de finalizar el contexto del tenant incluso si hay error
            if (tenancy()->initialized) {
                tenancy()->end();
            }

            $this->error('❌ Error al inicializar datos del tenant: '.$e->getMessage());
            $this->newLine();
            $this->error($e->getTraceAsString());

            return Command::FAILURE;
        }

        // Mostrar resumen
        $this->newLine();
        $this->info('✨ ¡Tenant creado exitosamente!');
        $this->newLine();

        $this->table(
            ['Campo', 'Valor'],
            [
                ['Tenant ID', $tenantId],
                ['Dominio', $domain],
                ['Base de datos', "tenant_{$tenantId}"],
                ['Seeders ejecutados', $this->option('seed') ? 'Sí' : 'No'],
            ]
        );

        $this->newLine();
        $scheme = parse_url(config('app.url'), PHP_URL_SCHEME) ?? ($this->isProduction() ? 'https' : 'http');
        $this->info("🌍 Accede en: {$scheme}://{$domain}");

        return Command::SUCCESS;
    }

    protected function getDomain(string $tenantId): string
    {
        $appUrl = config('app.url');
        $baseDomain = parse_url($appUrl, PHP_URL_HOST) ?? $appUrl;

        return "{$tenantId}.{$baseDomain}";
    }

    protected function isProduction(): bool
    {
        return config('app.env') === 'production';
    }

    protected function ensureActivityLogTableExists(): void
    {
        $connection = config('tenancy.database.central_connection');
        if (! $connection || ! config("database.connections.{$connection}")) {
            $connection = 'mysql';
        }

        $schema = Schema::connection($connection);

        // Eliminar y recrear la tabla si existe para asegurar las columnas correctas
        if ($schema->hasTable('activity_log')) {
            $this->info('📋 Recreando tabla activity_log...');
            $schema->dropIfExists('activity_log');
        } else {
            $this->info('📋 Creando tabla activity_log...');
        }

        $schema->create('activity_log', function ($table) {
            $table->bigIncrements('id');
            $table->string('log_name')->nullable();
            $table->text('description');
            $table->string('subject_type')->nullable();
            $table->string('subject_id')->nullable();
            $table->string('event')->nullable();
            $table->string('causer_type')->nullable();
            $table->unsignedBigInteger('causer_id')->nullable();
            $table->json('properties')->nullable();
            $table->uuid('batch_uuid')->nullable();
            $table->timestamps();
            $table->index('log_name');
            $table->index(['subject_type', 'subject_id']);
            $table->index(['causer_type', 'causer_id']);
        });

        $this->info('✅ Tabla activity_log creada');
    }
}
