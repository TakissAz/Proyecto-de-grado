<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Groq API Key
    |--------------------------------------------------------------------------
    |
    | The OpenAI-compatible PHP client uses this Groq key to authenticate
    | against Groq's API. No OpenAI credential is required.
    */

    'api_key' => env('GROQ_API_KEY'),
    'organization' => null,

    /*
    |--------------------------------------------------------------------------
    | Organization and Project
    |--------------------------------------------------------------------------
    |
    | Groq does not require the OpenAI organization or project headers.
    */
    'project' => null,

    /*
    |--------------------------------------------------------------------------
    | Groq OpenAI-compatible Base URL
    |--------------------------------------------------------------------------
    |
    | Groq exposes an OpenAI-compatible endpoint, allowing the existing PHP
    | client to be reused without coupling clinical rules to the provider.
    */
    'base_uri' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),

    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    |
    | The timeout may be used to specify the maximum number of seconds to wait
    | for a response. By default, the client will time out after 30 seconds.
    */

    'request_timeout' => env('GROQ_REQUEST_TIMEOUT', 30),

    'recipe_ranking' => [
        'enabled' => env('GROQ_RECIPE_RANKING_ENABLED', false),
        'model' => env('GROQ_RECIPE_MODEL', 'openai/gpt-oss-20b'),
        'max_candidates' => env('GROQ_RECIPE_MAX_CANDIDATES', 12),
        'ai_weight' => env('GROQ_RECIPE_AI_WEIGHT', 0.30),
    ],
];
