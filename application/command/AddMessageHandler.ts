import Groq from "groq-sdk"
import fs from 'fs'
import path from 'path'

export class AddMessageHandler {
    readonly api_Key = process.env.API_KEY;
    private _groq: Groq

    constructor() {
        this._groq = new Groq({
            apiKey: this.api_Key,
        });
    }

    async handle(command: AddMessageCommand): Promise<AddMessageResponse> {
        const instruction: any[] = []
        const history: any[] = []
        const conversation = [
            ...instruction,
            ...history,
            {
                role: "user",
                content: command.message,
            },
        ]

        const completion = await this._groq.chat.completions.create({
            messages: conversation,
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            max_tokens: 350,
        });

        return {
            message: completion.choices[0]?.message?.content?.trim() || "No pude generar una respuesta."
        }
    }
}

export interface AddMessageCommand {
    message: string
}

export interface AddMessageResponse {
    message: string
}