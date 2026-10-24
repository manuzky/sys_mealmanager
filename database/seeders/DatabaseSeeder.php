<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PositionSeeder::class,
            AreaSeeder::class,
            PersonnelSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,

            // Datos ficticios para desarrollo y pruebas.
            DemoDataSeeder::class,
            MealSeeder::class,
        ]);
    }
}