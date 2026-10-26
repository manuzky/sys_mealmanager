<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Meal;
use App\Models\MealRequest;
use App\Models\MealRequestItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MealRequestDemoSeeder extends Seeder
{
    public function run(): void
    {
        $areas = Area::query()
            ->where('active', true)
            ->with('personnels')
            ->get();

        $mealIds = Meal::query()
            ->where('active', true)
            ->orderBy('id')
            ->pluck('id')
            ->all();

        if ($areas->isEmpty() || empty($mealIds)) {
            $this->command->warn(
                'Se necesitan áreas activas y comidas activas para generar los pedidos.'
            );

            return;
        }

        $createdBy = User::query()->value('id');
        $weekStart = Carbon::now()->startOfWeek(Carbon::MONDAY);

        $weekStarts = [
            $weekStart->copy(),
            $weekStart->copy()->addWeek(),
        ];

        $days = [
            'monday' => 0,
            'tuesday' => 1,
            'wednesday' => 2,
            'thursday' => 3,
            'friday' => 4,
        ];

        $requestsCreated = 0;
        $assignmentsCreated = 0;
        $exceptionsCreated = 0;
        $absencesCreated = 0;

        DB::transaction(function () use (
            $areas,
            $mealIds,
            $createdBy,
            $weekStarts,
            $days,
            &$requestsCreated,
            &$assignmentsCreated,
            &$exceptionsCreated,
            &$absencesCreated
        ) {
            foreach ($weekStarts as $weekIndex => $start) {
                foreach ($areas as $area) {
                    $personnels = $area->personnels
                        ->sortBy('id')
                        ->values();

                    if ($personnels->isEmpty()) {
                        continue;
                    }

                    // Menú general del área: permanece guardado en el pedido.
                    $generalMenu = [];

                    foreach ($days as $day => $offset) {
                        $mealIndex = ($weekIndex * 5 + $offset)
                            % count($mealIds);

                        $generalMenu["{$day}_meal_id"] = $mealIds[$mealIndex];
                    }

                    $request = MealRequest::updateOrCreate(
                        [
                            'area_id' => $area->id,
                            'week_start' => $start->toDateString(),
                        ],
                        [
                            'created_by' => $createdBy,
                            ...$generalMenu,
                        ]
                    );

                    $requestsCreated++;

                    foreach ($days as $day => $offset) {
                        $date = $start->copy()
                            ->addDays($offset)
                            ->toDateString();

                        $generalMealId = $generalMenu["{$day}_meal_id"];

                        // Dos ausencias en total: una en informática y otra
                        // en Administración, en días diferentes.
                        $absenceArea = match (strtolower($area->name)) {
                            'ait', 'informática', 'informatica' => 'informatica',
                            'administración', 'administracion' => 'administracion',
                            default => null,
                        };

                        $absenceDay = $absenceArea === 'informatica'
                            ? 'wednesday'
                            : ($absenceArea === 'administracion' ? 'thursday' : null);

                        $hasAbsence = $absenceDay === $day
                            && $personnels->isNotEmpty();

                        $absentPersonnelId = null;

                        if ($hasAbsence) {
                            $absentPersonnelId = $personnels->first()->id;
                            $absencesCreated++;
                        }

                        // Entre 2 y 4 alternativas por área y día,
                        // si hay suficientes personas y comidas activas.
                        $eligiblePersonnels = $personnels
                            ->reject(fn ($personnel) => $personnel->id === $absentPersonnelId)
                            ->values();

                        $alternativeCount = count($mealIds) > 1
                            ? min(
                                $eligiblePersonnels->count(),
                                random_int(2, 4)
                            )
                            : 0;

                        $alternativeIds = $eligiblePersonnels
                            ->shuffle()
                            ->take($alternativeCount)
                            ->pluck('id')
                            ->all();

                        foreach ($personnels as $personnel) {
                            // Si falta, no se genera comida para esa persona.
                            if ($personnel->id === $absentPersonnelId) {
                                continue;
                            }

                            $assignedMealId = $generalMealId;

                            if (in_array($personnel->id, $alternativeIds, true)) {
                                $alternatives = array_values(array_filter(
                                    $mealIds,
                                    fn ($mealId) => $mealId !== $generalMealId
                                ));

                                $assignedMealId = $alternatives[
                                    array_rand($alternatives)
                                ];

                                $exceptionsCreated++;
                            }

                            MealRequestItem::updateOrCreate(
                                [
                                    'meal_request_id' => $request->id,
                                    'personnel_id' => $personnel->id,
                                    'day' => $date,
                                ],
                                [
                                    'meal_id' => $assignedMealId,
                                ]
                            );

                            $assignmentsCreated++;
                        }
                    }
                }
            }
        });

        $this->command->info("Pedidos semanales procesados: {$requestsCreated}");
        $this->command->info("Asignaciones procesadas: {$assignmentsCreated}");
        $this->command->info("Menús alternativos asignados: {$exceptionsCreated}");
        $this->command->info("Ausencias simuladas: {$absencesCreated}");
    }
}