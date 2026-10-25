<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte semanal de cocina</title>

    <style>
        @page {
            margin: 30px 32px 55px 32px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1f2937;
            font-size: 10px;
        }

        .header {
            border-bottom: 3px solid #1e4773;
            padding-bottom: 16px;
            margin-bottom: 22px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            border: none;
            padding: 0;
            vertical-align: top;
        }

        .logo {
            width: 48px;
            height: 48px;
            background: #1e4773;
            color: #ffffff;
            text-align: center;
            vertical-align: middle !important;
            font-size: 17px;
            font-weight: bold;
        }

        .kicker {
            color: #1e4773;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 7px;
            text-transform: uppercase;
        }

        h1 {
            color: #1e4773;
            font-size: 21px;
            margin: 0 0 7px;
        }

        .subtitle {
            color: #64748b;
            margin: 4px 0;
            font-size: 9px;
        }

        .week {
            color: #334155;
            font-size: 10px;
            margin-top: 8px;
        }

        .day {
            margin-bottom: 24px;
            page-break-inside: avoid;
        }

        .day-heading {
            background: #1e4773;
            color: #ffffff;
            padding: 10px;
            font-size: 12px;
            font-weight: bold;
            margin: 18px 0 12px;
        }

        .day-heading small {
            color: #e2eaf4;
            font-size: 9px;
            font-weight: normal;
        }

        .area-heading {
            color: #1e4773;
            font-size: 11px;
            font-weight: bold;
            margin: 14px 0 6px;
        }

        table.data {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .data th {
            background: #edf3f9;
            color: #254b72;
            text-align: left;
            font-size: 9px;
            padding: 8px;
            border: 1px solid #d6e0eb;
        }

        .data td {
            padding: 8px;
            border: 1px solid #dfe5ec;
            vertical-align: top;
        }

        .data .quantity {
            text-align: center;
            width: 65px;
            font-weight: bold;
        }

        .names {
            line-height: 1.6;
        }

        .total-box {
            background: #f0f5fa;
            border-left: 4px solid #1e4773;
            padding: 12px;
            margin-top: 14px;
        }

        .total-title {
            color: #1e4773;
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 10px;
        }

        table.totals {
            width: 100%;
            border-collapse: collapse;
        }

        .totals td {
            border: none;
            padding: 5px 8px 5px 0;
            font-size: 9px;
        }

        .totals .number {
            text-align: right;
            width: 55px;
            font-size: 14px;
            font-weight: bold;
            color: #1e4773;
        }

        .empty {
            background: #f8fafc;
            border: 1px solid #dbe3ee;
            padding: 16px;
            color: #64748b;
            text-align: center;
        }

        .footer {
            margin-top: 22px;
            padding-top: 9px;
            border-top: 1px solid #dbe3ee;
            color: #64748b;
            font-size: 8px;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="kicker">Control de alimentación</div>
                    <h1>REPORTE SEMANAL<br>DE COCINA</h1>
                    <p class="subtitle">
                        Consolidado de raciones por día y área
                    </p>
                    <p class="week">
                        <strong>Semana:</strong>
                        {{ \Carbon\Carbon::parse($weekStart)->format('d/m/Y') }}
                        al
                        {{ \Carbon\Carbon::parse($weekEnd)->format('d/m/Y') }}
                    </p>
                </td>
                <td style="width: 55px; text-align: right;">
                    <div class="logo">RC</div>
                </td>
            </tr>
        </table>
    </div>

    @forelse ($days as $day)
        <div class="day">
            <div class="day-heading">
                {{ mb_strtoupper($day['label'], 'UTF-8') }}
                <small>
                    &nbsp;|&nbsp;
                    {{ array_sum(array_values($day['totals'])) }}
                    raciones asignadas
                </small>
            </div>

            @foreach ($day['areas'] as $areaName => $area)
                <div class="area-heading">
                    {{ $areaName }}
                </div>

                <table class="data">
                    <thead>
                        <tr>
                            <th>Comida</th>
                            <th>Trabajadores asignados</th>
                            <th class="quantity">Raciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($area['meals'] as $mealName => $meal)
                            <tr>
                                <td>{{ $mealName }}</td>
                                <td class="names">
                                    {{ implode(', ', $meal['personnel']) ?: 'Sin nombres disponibles' }}
                                </td>
                                <td class="quantity">
                                    {{ $meal['quantity'] }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endforeach

            <div class="total-box">
                <div class="total-title">
                    CONSOLIDADO GENERAL DEL DÍA
                </div>

                <table class="totals">
                    <tbody>
                        @foreach ($day['totals'] as $mealName => $quantity)
                            <tr>
                                <td>{{ $mealName }}</td>
                                <td class="number">{{ $quantity }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @empty
        <div class="empty">
            No existen comidas asignadas para la semana seleccionada.
        </div>
    @endforelse

</body>
</html>