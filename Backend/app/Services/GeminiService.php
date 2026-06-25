<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class GeminiService
{
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    /**
     * Generate content using Gemini AI
     */
    public function generateResponse($prompt)
    {
        try {
            if (!$this->apiKey) {
                throw new Exception('Gemini API Key not found in environment.');
            }

            $response = Http::post($this->baseUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                // Extract the text from the response
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            }

            throw new Exception('Gemini API Error: ' . $response->body());

        } catch (Exception $e) {
            logger()->error('Gemini Service Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Analyze a ticket and return a summary, suggestion, and category
     */
    public function analyzeTicket($title, $description)
    {
        $prompt = "You are an AI support assistant. Please analyze the following support ticket and return a JSON response with exactly three fields: 
        1. 'summary' (a brief 1-sentence summary)
        2. 'suggestion' (a practical next step for the support team)
        3. 'category' (a 1-2 word category like 'Network', 'Hardware', 'Software', 'Billing', etc.)
        
        Ticket Title: {$title}
        Ticket Description: {$description}
        
        Return ONLY the JSON object.";

        $response = $this->generateResponse($prompt);

        if ($response) {
            // Try to extract JSON if Gemini adds markdown code blocks
            $cleanJson = preg_replace('/```json|```/', '', $response);
            $decoded = json_decode(trim($cleanJson), true);

            if (isset($decoded['summary']) && isset($decoded['suggestion']) && isset($decoded['category'])) {
                return $decoded;
            }
        }

        return [
            'summary' => 'AI was unable to generate a summary.',
            'suggestion' => 'Please review the ticket manually.',
            'category' => 'Uncategorized'
        ];
    }
}
