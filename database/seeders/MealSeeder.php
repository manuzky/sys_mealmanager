<?php

namespace Database\Seeders;

use App\Models\Meal;
use Illuminate\Database\Seeder;

class MealSeeder extends Seeder
{
    public function run(): void
    {
        $meals = [
            [
                'name' => 'Pollo al horno básico',
                'ingredients' => 'Pollo entero, cebolla, ajo, zanahoria, pimientos, vino blanco, caldo de pollo, mostaza Dijon, hierbas provenzales, aceite de oliva, pimienta y sal.',
                'photo_path' => 'meals/comida1.jpg',
            ],
            [
                'name' => 'Crema de mascarpone',
                'ingredients' => 'Queso mascarpone, yemas de huevo, azúcar y agua.',
                'photo_path' => 'meals/comida2.jpg',
            ],
            [
                'name' => 'Ramen vegano',
                'ingredients' => 'Ajo, jengibre, aceite de oliva y sésamo, puerro, pak choi, setas variadas, apio, caldo vegetal, alga kombu, shiitake, noodles, tahini, miso, salsa de soja o tamari, vinagres y nata vegetal.',
                'photo_path' => 'meals/comida3.jpg',
            ],
            [
                'name' => 'Sándwich de langosta vegana',
                'ingredients' => 'Palmitos, alcaparras, chalota, pimiento rojo, apio, alga nori, mayonesa o veganesa, pimentón, ajo en polvo, condimento Old Bay y limón.',
                'photo_path' => 'meals/comida4.jpg',
            ],
            [
                'name' => 'Bizcocho de naranja navideño',
                'ingredients' => 'Yogur natural, huevos, azúcar, aceite de oliva, harina, levadura, ralladura de naranja, agua de azahar, albaricoques secos y uvas pasas.',
                'photo_path' => 'meals/comida5.jpg',
            ],
            [
                'name' => 'Falafel de garbanzos',
                'ingredients' => 'Garbanzos secos, cebolla, ajo, cilantro, perejil, semillas de cilantro, comino, pan rallado, harina, tahini o sésamo, levadura, pimienta, sal y aceite para freír. Salsa opcional de tahini y limón.',
                'photo_path' => 'meals/comida6.jpg',
            ],
            [
                'name' => 'Pesto alla trapanese',
                'ingredients' => 'Tomates maduros, tomates secos, ajo, albahaca, almendras peladas y queso de cabra curado opcional.',
                'photo_path' => 'meals/comida7.jpg',
            ],
        ];

        foreach ($meals as $meal) {
            Meal::updateOrCreate(
                ['name' => $meal['name']],
                [
                    'ingredients' => $meal['ingredients'],
                    'photo_path' => $meal['photo_path'],
                    'active' => true,
                ],
            );
        }
    }
}
