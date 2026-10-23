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
use App\Models\Area;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $faker = Faker::create('es_ES');
        $faker->seed(20261022);

        /*
        |--------------------------------------------------------------------------
        | 0. CARGOS
        |--------------------------------------------------------------------------
        */

        $positions = [
            ['name' => 'Administrador del Sistema', 'description' => 'Acceso total al sistema'],
            ['name' => 'Gerente', 'description' => 'Dirección y supervisión de la gestión institucional'],
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

        $positionIds = Position::whereIn('name', array_column($positions, 'name'))->pluck('id')->all();

        /*
        |--------------------------------------------------------------------------
        | 1. ÁREAS
        |--------------------------------------------------------------------------
        */

        $areas = [
            ['name' => 'Administración', 'description' => 'Gestión administrativa y financiera'],
            ['name' => 'Recursos Humanos', 'description' => 'Gestión del personal'],
            ['name' => 'Informática', 'description' => 'Sistemas y soporte tecnológico'],
            ['name' => 'Presupuesto', 'description' => 'Planificación y control presupuestario'],
            ['name' => 'Atención al Ciudadano', 'description' => 'Atención y orientación al público'],
            ['name' => 'Servicios Generales', 'description' => 'Apoyo y servicios generales'],
            ['name' => 'Dirección', 'description' => 'Coordinación y dirección institucional'],
            ['name' => 'Compras', 'description' => 'Adquisiciones y proveedores'],
        ];

        foreach ($areas as $area) {
            Area::updateOrCreate(
                ['name' => $area['name']],
                ['description' => $area['description'], 'active' => true]
            );
        }

        $areaIds = Area::whereIn('name', array_column($areas, 'name'))->pluck('id')->all();

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

            'areas.view' => 'Ver Áreas',
            'areas.create' => 'Crear Áreas',
            'areas.edit' => 'Editar Áreas',
            'areas.delete' => 'Eliminar Áreas',
            'areas.toggle-status' => 'Activar o Desactivar Áreas',

            'meals.view' => 'Ver Comidas',
            'meals.create' => 'Crear Comidas',
            'meals.edit' => 'Editar Comidas',
            'meals.delete' => 'Eliminar Comidas',
            'meals.toggle-status' => 'Activar o Desactivar Comidas',
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

        $administrador = Role::firstOrCreate(['name' => 'Administrador', 'guard_name' => 'web',]);
        $supervisor = Role::firstOrCreate(['name' => 'Supervisor', 'guard_name' => 'web',]);
        $usuario = Role::firstOrCreate(['name' => 'Usuario', 'guard_name' => 'web',]);

        // Administrador de pruebas: todos los permisos.
        $administrador->syncPermissions(Permission::where('guard_name', 'web')->get());

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
            'areas.view',
            'areas.create',
            'areas.edit',
            'areas.delete',
            'areas.toggle-status',
            'meals.view',
            'meals.create',
            'meals.edit',
            'meals.delete',
            'meals.toggle-status',
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
        | 4. 173 PERSONAS FICTICIAS
        |--------------------------------------------------------------------------
        */

        $cargosConAcceso = [
            'Administrador del Sistema',
            'Gerente',
        ];

        $cargosConAccesoIds = Position::whereIn('name', $cargosConAcceso)
            ->pluck('id')
            ->all();

        for ($i = 1; $i <= 173; $i++) {
            $number = str_pad((string) $i, 3, '0', STR_PAD_LEFT);
            $gender = $faker->randomElement(['male', 'female']);

            $firstName = $gender === 'male'
                ? $faker->firstNameMale()
                : $faker->firstNameFemale();

            // Las primeras 5 personas serán administradores.
            // Las siguientes 5 serán gerentes, si existe ese cargo.
            if ($i <= 5) {
                $positionId = Position::where('name', 'Administrador del Sistema')->value('id');
            } elseif ($i <= 10 && in_array(
                Position::where('name', 'Gerente')->value('id'),
                $cargosConAccesoIds
            )) {
                $positionId = Position::where('name', 'Gerente')->value('id');
            } else {
                $positionId = $faker->randomElement(
                    array_values(array_diff($positionIds, $cargosConAccesoIds))
                );
            }

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
                    'position_id' => $positionId,
                    'area_id' => $faker->randomElement($areaIds),
                    'status' => 'active',
                    'photo' => null,
                ]
            );

            // Solo los administradores y gerentes tendrán cuenta de acceso.
            if (in_array($positionId, $cargosConAccesoIds)) {
                $username = "demo{$number}";

                $user = User::updateOrCreate(
                    ['username' => $username],
                    [
                        'name' => trim($personnel->first_name . ' ' . $personnel->last_name),
                        'email' => $personnel->email,
                        'personnel_id' => $personnel->id,
                        'password' => Hash::make('123456789'),
                        'active' => true,
                    ]
                );

                if ($positionId === Position::where('name', 'Administrador del Sistema')->value('id')) {
                    $user->syncRoles([$administrador]);
                } else {
                    $user->syncRoles([$supervisor]);
                }
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
