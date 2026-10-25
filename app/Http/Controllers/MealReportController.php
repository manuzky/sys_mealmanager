<?php

namespace App\Http\Controllers;

use App\Models\MealRequest;
use App\Models\MealRequestItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MealReportController extends Controller
{
    public function index()
    {
        $weeks = MealRequest::query()
            ->select('week_start')
            ->distinct()
            ->orderByDesc('week_start')
            ->get()
            ->map(fn ($request) => Carbon::parse($request->week_start)->toDateString())
            ->values();

        return Inertia::render('Reports/Index', [
            'weeks' => $weeks,
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function chef(Request $request)
    {
        $request->validate([
            'week_start' => ['required', 'date', 'exists:meal_requests,week_start'],
        ]);

        $weekStart = Carbon::parse($request->week_start)->toDateString();
        $weekEnd = Carbon::parse($weekStart)->addDays(4)->toDateString();
        $days = [];

        for ($i = 0; $i < 5; $i++) {
            $date = Carbon::parse($weekStart)->addDays($i);
            $key = $date->toDateString();
            $days[$key] = [
                'label' => ucfirst($date->locale('es')->translatedFormat('l d/m/Y')),
                'areas' => [],
                'totals' => [],
            ];
        }

        $items = MealRequestItem::query()
            ->with(['meal', 'personnel', 'mealRequest.area'])
            ->whereNotNull('meal_id')
            ->whereBetween('day', [$weekStart, $weekEnd])
            ->whereHas('mealRequest', function ($query) use ($weekStart) {$query->whereDate('week_start', $weekStart);})
            ->get();

        foreach ($items as $item) {
            $dayKey = Carbon::parse($item->day)->toDateString();

            if (!isset($days[$dayKey]) || !$item->meal) {
                continue;
            }

            $areaName = $item->mealRequest?->area?->name ?? 'Área no disponible';
            $mealName = $item->meal->name;

            if (!isset($days[$dayKey]['areas'][$areaName]['meals'][$mealName])) {
                $days[$dayKey]['areas'][$areaName]['meals'][$mealName] = [
                    'quantity' => 0,
                    'personnel' => [],
                ];
            }

            $days[$dayKey]['areas'][$areaName]['meals'][$mealName]['quantity']++;

            if ($item->personnel) {
                $days[$dayKey]['areas'][$areaName]['meals'][$mealName]['personnel'][] = trim($item->personnel->first_name . ' ' . $item->personnel->last_name);
            }

            $days[$dayKey]['totals'][$mealName] = ($days[$dayKey]['totals'][$mealName] ?? 0) + 1;
        }

        $days = array_filter($days, function ($day) {
            return !empty($day['totals']);
        });


        $pdf = Pdf::loadView('reports.meals.chef', [
            'days' => $days,
            'weekStart' => $weekStart,
            'weekEnd' => $weekEnd,
        ])->setPaper('a4', 'portrait');

        // Renderizar primero todas las páginas.
        $pdf->render();
        $canvas = $pdf->getDomPDF()->getCanvas();
        $fontMetrics = $pdf->getDomPDF()->getFontMetrics();
        $font = $fontMetrics->getFont('DejaVu Sans', 'normal');
        $footerText = 'Documento de uso interno | Reporte generado el '. now()->format('d/m/Y H:i'). '. Las cantidades reflejan únicamente comidas asignadas.';

        // Pie de página repetido en todas las páginas.
        $canvas->page_text(32, 810, $footerText, $font, 7, [0.39, 0.45, 0.55]);

        // Numeración dinámica: 1/6, 2/6, 3/6...
        $canvas->page_text(520, 810, '{PAGE_NUM}/{PAGE_COUNT}', $font, 8, [0.12, 0.28, 0.45]);

        return $pdf->stream("reporte-chef-{$weekStart}.pdf");

    }

}