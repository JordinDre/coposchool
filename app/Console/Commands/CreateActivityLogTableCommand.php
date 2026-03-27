<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class CreateActivityLogTableCommand extends Command
{
    protected $signature = 'activitylog:create-table';

    protected $description = 'Create activity_log table in the central MySQL database';

    public function handle(): int
    {
        $this->info('Ejecutando migración para crear tabla activity_log...');

        try {
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2026_01_10_233110_create_activity_log_table_for_central_database.php',
                '--force' => true,
            ], $this->output);

            $this->info('✅ Tabla activity_log creada exitosamente.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Error al crear la tabla: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
