<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePersonnelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $personnelId = $this->route('personnel')->id;

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],

            'document_type' => ['required', 'in:V,E'],
            'id_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('personnels', 'id_number')->ignore($personnelId),
            ],

            'birth_date' => ['required', 'date'],
            'gender' => ['required', 'in:male,female'],
            'marital_status' => ['required', 'in:single,married,divorced,widowed'],

            'email_local' => ['required', 'string', 'max:100'],
            'email_domain' => ['required', 'string'],
            'email_custom_domain' => ['nullable', 'string', 'max:255'],

            'phone_code' => ['nullable', 'string'],
            'phone' => ['nullable', 'digits:7'],

            'secondary_phone_code' => ['nullable', 'string'],
            'secondary_phone' => ['nullable', 'digits:7'],

            'address' => ['nullable', 'string'],

            'position_id' => ['required', 'exists:positions,id'],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'photo_remove' => ['boolean'],
        ];
    }
}
