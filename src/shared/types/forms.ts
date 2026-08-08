/**
 * Form Types
 * 
 * Type definitions for form handling, validation, and state management.
 */

/**
 * Form field error
 */
export interface FieldError {
    type: string;
    message: string;
}

/**
 * Form errors
 */
export type FormErrors<T> = Partial<Record<keyof T, string | FieldError>>;

/**
 * Form touched fields
 */
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

/**
 * Form state
 */
export interface FormState<T> {
    values: T;
    errors: FormErrors<T>;
    touched: FormTouched<T>;
    isSubmitting: boolean;
    isValidating: boolean;
    isValid: boolean;
    isDirty: boolean;
    submitCount: number;
}

/**
 * Form field props
 */
export interface FieldProps<T, K extends keyof T> {
    name: K;
    value: T[K];
    onChange: (value: T[K]) => void;
    onBlur: () => void;
    error?: string | FieldError;
    touched?: boolean;
    disabled?: boolean;
}

/**
 * Form handlers
 */
export interface FormHandlers<T> {
    handleSubmit: (e?: React.FormEvent) => void;
    handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
    handleBlur: <K extends keyof T>(field: K) => () => void;
    setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
    setFieldError: <K extends keyof T>(field: K, error: string) => void;
    setFieldTouched: <K extends keyof T>(field: K, touched: boolean) => void;
    resetForm: () => void;
    validateForm: () => Promise<FormErrors<T>>;
}

/**
 * Form configuration
 */
export interface FormConfig<T> {
    initialValues: T;
    validate?: (values: T) => FormErrors<T> | Promise<FormErrors<T>>;
    onSubmit: (values: T) => void | Promise<void>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

/**
 * Validation rule
 */
export interface ValidationRule<T> {
    validate: (value: T) => boolean | Promise<boolean>;
    message: string;
}

/**
 * Field validation
 */
export type FieldValidation<T, K extends keyof T> = ValidationRule<T[K]>[];

/**
 * Form validation schema
 */
export type ValidationSchema<T> = Partial<
    Record<keyof T, FieldValidation<T, keyof T>>
>;

/**
 * Select option
 */
export interface SelectOption<T = string> {
    value: T;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

/**
 * File upload state
 */
export interface FileUploadState {
    file: File | null;
    preview?: string;
    progress: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    error?: string;
}
