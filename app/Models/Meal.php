<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Meal extends Model
{
    protected $fillable = [
        'name',
        'ingredients',
        'photo_path',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function requestItems(): HasMany
    {
        return $this->hasMany(MealRequestItem::class);
    }
}
