<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MigrateCategoriesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'source_store_id' => 'required|integer|exists:store_connections,id',
            'target_store_id' => 'required|integer|exists:store_connections,id',
            'categories' => 'required|array',
            'categories.*' => 'array',
            'operation' => 'required|in:create,update,delete,all',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'source_store_id.required' => 'Source store is required',
            'source_store_id.exists' => 'Source store not found',
            'target_store_id.required' => 'Target store is required',
            'target_store_id.exists' => 'Target store not found',
            'categories.required' => 'Categories are required',
            'categories.array' => 'Categories must be an array',
            'operation.required' => 'Operation type is required',
            'operation.in' => 'Operation must be create, update, delete, or all',
        ];
    }
}
