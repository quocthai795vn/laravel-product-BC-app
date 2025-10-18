<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConnectStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Change to auth check if needed
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'store_hash' => 'required|string|max:255',
            'access_token' => 'required|string',
            'type' => 'required|in:source,target',
            'tree_id' => 'required|integer',
            'tree_name' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Store name is required',
            'store_hash.required' => 'Store hash is required',
            'access_token.required' => 'Access token is required',
            'type.required' => 'Store type is required',
            'type.in' => 'Store type must be either source or target',
            'tree_id.required' => 'Tree ID is required',
        ];
    }
}
