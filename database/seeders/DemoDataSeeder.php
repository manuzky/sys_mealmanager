<?php

namespace Database\Seeders;

use App\Models\Personnel;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $faker = Faker::create('es_ES');
        $faker->seed(20261022);

        /*
        |--------------------------------------------------------------------------
        | 1. CARGOS
        |--------------------------------------------------------------------------
        */

        $positions = [
            ['name' => 'Administrador del Sistema', 'description' => 'Acceso total al sistema'],
            ['name' => 'Coordinador', 'description' => 'Coordina las actividades del área'],
            ['name' => 'Analista', 'description' => 'Análisis y gestión de información'],
            ['name' => 'Desarrollador', 'description' => 'Desarrollo y mantenimiento de sistemas'],
            ['name' => 'Técnico de Soporte', 'description' => 'Soporte técnico a usuarios'],
            ['name' => 'Asistente Administrativo', 'description' => 'Apoyo administrativo'],
        ];

        foreach ($positions as $position) {
            Position::updateOrCreate(
                ['name' => $position['name']],
                ['description' => $position['description'], 'active' => true]
            );
        }

        $positionIds = Position::whereIn('name', array_column($positions, 'name'))
            ->pluck('id')
            ->all();

        /*
        |--------------------------------------------------------------------------
        | 2. PERMISOS
        |--------------------------------------------------------------------------
        */

        $permissions = [
            'personnel.view' => 'Ver Personal',
            'personnel.create' => 'Crear Personal',
            'personnel.edit' => 'Editar Personal',
            'personnel.toggle-status' => 'Activar o Desactivar Personal',

            'users.view' => 'Ver Usuarios',
            'users.create' => 'Crear Usuarios',
            'users.edit' => 'Editar Usuarios',
            'users.toggle-status' => 'Activar o Desactivar Usuarios',

            'roles.view' => 'Ver Roles',
            'roles.create' => 'Crear Roles',
            'roles.edit' => 'Editar Roles',
            'roles.delete' => 'Eliminar Roles',

            'positions.view' => 'Ver Cargos',
            'positions.create' => 'Crear Cargos',
            'positions.edit' => 'Editar Cargos',
            'positions.delete' => 'Eliminar Cargos',
            'positions.toggle-status' => 'Activar o Desactivar Cargos',

            'permissions.view' => 'Ver Permisos',
            'permissions.create' => 'Crear Permisos',
            'permissions.edit' => 'Editar Permisos',
            'permissions.delete' => 'Eliminar Permisos',
        ];

        foreach ($permissions as $name => $displayName) {
            Permission::updateOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['display_name' => $displayName]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | 3. ROLES Y SUS PERMISOS
        |--------------------------------------------------------------------------
        */

        $administrador = Role::firstOrCreate([
            'name' => 'Administrador',
            'guard_name' => 'web',
        ]);

        $supervisor = Role::firstOrCreate([
            'name' => 'Supervisor',
            'guard_name' => 'web',
        ]);

        $usuario = Role::firstOrCreate([
            'name' => 'Usuario',
            'guard_name' => 'web',
        ]);

        // Administrador de pruebas: todos los permisos.
        $administrador->syncPermissions(
            Permission::where('guard_name', 'web')->get()
        );

        // Supervisor: gestión operativa, sin administrar roles ni permisos.
        $supervisor->syncPermissions([
            'personnel.view',
            'personnel.create',
            'personnel.edit',
            'personnel.toggle-status',
            'users.view',
            'users.create',
            'users.edit',
            'positions.view',
        ]);

        // Usuario: acceso de consulta.
        $usuario->syncPermissions([
            'personnel.view',
            'users.view',
            'positions.view',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | 4. 100 PERSONAS FICTICIAS Y SUS USUARIOS
        |--------------------------------------------------------------------------
        */

        for ($i = 1; $i <= 100; $i++) {
            $number = str_pad((string) $i, 3, '0', STR_PAD_LEFT);

            $gender = $faker->randomElement(['male', 'female']);

            $firstName = $gender === 'male'
                ? $faker->firstNameMale()
                : $faker->firstNameFemale();

            $personnel = Personnel::updateOrCreate(
                ['id_number' => (string) (20000000 + $i)],
                [
                    'first_name' => $firstName,
                    'last_name' => $faker->lastName() . ' ' . $faker->lastName(),
                    'document_type' => $faker->randomElement(['V', 'E']),
                    'birth_date' => $faker->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
                    'gender' => $gender,
                    'marital_status' => $faker->randomElement([
                        'single',
                        'married',
                        'divorced',
                        'widowed',
                    ]),
                    'email' => "persona{$number}@example.test",
                    'phone' => '0412' . str_pad((string) (1000000 + $i), 7, '0', STR_PAD_LEFT),
                    'secondary_phone' => null,
                    'address' => $faker->address(),
                    'position_id' => $faker->randomElement($positionIds),
                    'status' => 'active',
                    'photo' => null,
                ]
            );

            // Crea una cuenta por cada persona.
            $user = User::updateOrCreate(
                ['username' => "demo{$number}"],
                [
                    'name' => trim($personnel->first_name . ' ' . $personnel->last_name),
                    'email' => $personnel->email,
                    'personnel_id' => $personnel->id,
                    'password' => Hash::make('123456789'),
                    'active' => true,
                ]
            );

            // Distribución de roles para probar distintos permisos.
            if ($i <= 5) {
                $user->syncRoles([$administrador]);
            } elseif ($i <= 20) {
                $user->syncRoles([$supervisor]);
            } else {
                $user->syncRoles([$usuario]);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
