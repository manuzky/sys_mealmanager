<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            [
                'name' => 'Administración',
                'description' => 'Gestión administrativa de la institución.',
                'active' => true,
            ],
            [
                'name' => 'Recursos Humanos',
                'description' => 'Gestión del personal y recursos humanos.',
                'active' => true,
            ],
            [
                'name' => 'Informática',
                'description' => 'Soporte técnico y sistemas informáticos.',
                'active' => true,
            ],
            [
                'name' => 'Presupuesto',
                'description' => 'Planificación y control presupuestario.',
                'active' => true,
            ],
            [
                'name' => 'Atención al Ciudadano',
                'description' => 'Atención y orientación al ciudadano.',
                'active' => true,
            ],
            [
                'name' => 'Servicios Generales',
                'description' => 'Mantenimiento y servicios generales.',
                'active' => true,
            ],
            [
                'name' => 'Dirección',
                'description' => 'Dirección y coordinación institucional.',
                'active' => true,
            ],
            [
                'name' => 'Compras',
                'description' => 'Gestión de compras y adquisiciones.',
                'active' => true,
            ],
        ];

        foreach ($areas as $area) {
            Area::updateOrCreate(
                ['name' => $area['name']],
                $area
            );
        }
    }
}
