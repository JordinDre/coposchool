<?php

namespace Tests;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/**
 * Base test case for tests that run inside a tenant context.
 *
 * Uses an in-memory SQLite database for the tenant so every test gets a
 * perfectly isolated, freshly migrated tenant schema without relying on
 * file cleanup between runs.
 *
 * HTTP helpers skip the tenancy initialization middleware since tenancy
 * is already active from setUp().
 */
abstract class TenantTestCase extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        config(['activitylog.enabled' => false]);

        // Point the "tenant" connection at a fresh in-memory SQLite database.
        // We MUST use a named in-memory connection (via "url") so that all code
        // within this request accesses the same in-memory store.
        config([
            'database.connections.tenant' => [
                'driver'                  => 'sqlite',
                'database'                => ':memory:',
                'prefix'                  => '',
                'foreign_key_constraints' => true,
            ],
        ]);

        // Boot the fresh in-memory connection so it's ready before migrations
        DB::connection('tenant')->statement('PRAGMA foreign_keys = ON');

        // Create the Tenant record in the central DB without lifecycle events
        // (avoids CreateDatabase which tries to provision a real MySQL DB)
        $this->tenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id'           => 'test',
                'company_name' => 'Test School',
            ]);
        });

        // Manually initialize tenancy — switches default connection to "tenant"
        tenancy()->initialize($this->tenant);

        // Migrate tenant tables onto the in-memory tenant connection
        $this->artisan('migrate', [
            '--path'     => 'database/migrations/tenant',
            '--database' => 'tenant',
            '--force'    => true,
        ]);
    }

    protected function tearDown(): void
    {
        tenancy()->end();
        DB::purge('tenant');

        parent::tearDown();
    }

    // ── HTTP helpers ──────────────────────────────────────────────────────────

    /**
     * GET that skips tenancy middleware (tenancy is already initialized).
     */
    protected function tenantGet(string $uri, array $headers = []): \Illuminate\Testing\TestResponse
    {
        return $this->withoutMiddleware([InitializeTenancyByDomain::class, PreventAccessFromCentralDomains::class])
            ->get($uri, $headers);
    }

    protected function tenantPost(string $uri, array $data = [], array $headers = []): \Illuminate\Testing\TestResponse
    {
        return $this->withoutMiddleware([InitializeTenancyByDomain::class, PreventAccessFromCentralDomains::class])
            ->post($uri, $data, $headers);
    }

    protected function tenantPut(string $uri, array $data = [], array $headers = []): \Illuminate\Testing\TestResponse
    {
        return $this->withoutMiddleware([InitializeTenancyByDomain::class, PreventAccessFromCentralDomains::class])
            ->put($uri, $data, $headers);
    }

    protected function tenantDelete(string $uri, array $data = [], array $headers = []): \Illuminate\Testing\TestResponse
    {
        return $this->withoutMiddleware([InitializeTenancyByDomain::class, PreventAccessFromCentralDomains::class])
            ->delete($uri, $data, $headers);
    }

    // ── Factory helpers ───────────────────────────────────────────────────────

    /**
     * Create an admin user in the tenant DB with the given permissions.
     *
     * @param  string[]  $permissions
     */
    protected function makeAdminUser(array $permissions = []): User
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $role = Role::firstOrCreate(['name' => 'administrador', 'guard_name' => 'web']);

        foreach ($permissions as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            $role->givePermissionTo($permission);
        }

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
