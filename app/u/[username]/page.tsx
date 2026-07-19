'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { toast } from 'sonner';

import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messagesSchema } from '@/schemas/messageSchema';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
    return messageString
        .split(specialChar)
        .map((message) => message.trim())
        .filter(Boolean);
};

const initialMessageString = "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {

    const { username } = useParams<{ username: string }>();

    const form = useForm<z.infer<typeof messagesSchema>>({
        resolver: zodResolver(messagesSchema),
        defaultValues: {
            content: '',
        },
    });

    const messageContent = form.watch('content');

    const [isLoading, setIsLoading] = useState(false);
    const [completion, setCompletion] = useState(initialMessageString);
    const [isSuggestLoading, setIsSuggestLoading] = useState(false);
    const [suggestError, setSuggestError] = useState<string | null>(null);

    const handleMessageClick = (message: string) => {
        form.setValue('content', message);
    };

    const onSubmit = async (data: z.infer<typeof messagesSchema>) => {
        setIsLoading(true);

        try {
            const response = await axios.post<ApiResponse>(
                '/api/send-message', { ...data, username });

            toast(response.data.message);

            form.reset({
                content: '',
            });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast(
                axiosError.response?.data.message ??
                'Failed to send message'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSuggestedMessages = async () => {

        setIsSuggestLoading(true);
        setSuggestError(null);
        setCompletion('');

        try {
            const response = await fetch('/api/suggest-messages', {
                method: 'POST',
            });

            if (!response.ok) {
                let message = 'Failed to fetch suggested messages.';

                try {
                    const errorData = await response.json();
                    message = errorData.message ?? message;
                } catch {
                }

                throw new Error(message);
            }

            if (!response.body) {
                throw new Error('No response body received.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let generatedText = '';

            while (true) {

                const { value, done } = await reader.read();

                if (done) break;

                generatedText += decoder.decode(value, {
                    stream: true,
                });

                setCompletion(generatedText);
            }

        } catch (error) {
            console.error(error);

            setSuggestError(
                error instanceof Error
                    ? error.message
                    : 'Something went wrong.'
            );
        } finally {
            setIsSuggestLoading(false);
        }
    };

    return (
        <div className="container mx-auto my-8 max-w-4xl rounded bg-white p-6">
            <h1 className="mb-6 text-center text-4xl font-bold">
                Public Profile Link
            </h1>

            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <FieldGroup>
                    <Controller
                        name="content"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="message">
                                    Send Anonymous Message to @{username}
                                </FieldLabel>

                                <Textarea
                                    {...field}
                                    id="message"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Write your anonymous message..."
                                    className="min-h-[120px]"
                                />

                                <FieldDescription>
                                    Your identity will remain anonymous.
                                </FieldDescription>

                                {fieldState.invalid && (
                                    <FieldError
                                        errors={[fieldState.error]}
                                    />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>

                <div className="flex justify-center">
                    <Button
                        type="submit"
                        disabled={isLoading || !messageContent}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}

                        {isLoading ? 'Please wait...' : 'Send It'}
                    </Button>
                </div>
            </form>

            <div className="my-8 space-y-4">
                <div className="space-y-2">
                    <Button
                        onClick={fetchSuggestedMessages}
                        disabled={isSuggestLoading}
                    >
                        {isSuggestLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}

                        {isSuggestLoading
                            ? 'Generating...'
                            : 'Suggest Messages'}
                    </Button>

                    <p>Click on any message below to select it.</p>
                </div>

                <Card>
                    <CardHeader>
                        <h3 className="text-xl font-semibold">
                            Suggested Messages
                        </h3>
                    </CardHeader>

                    <CardContent className="flex flex-col space-y-3">
                        {suggestError ? (
                            <p className="text-red-500">
                                {suggestError}
                            </p>
                        ) : (
                            parseStringMessages(completion).map(
                                (message, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="justify-start text-left whitespace-normal"
                                        onClick={() =>
                                            handleMessageClick(message)
                                        }
                                    >
                                        {message}
                                    </Button>
                                )
                            )
                        )}
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-6" />

            <div className="text-center">
                <div className="mb-4">
                    Get Your Own Anonymous Message Board
                </div>

                <Link href="/sign-up">
                    <Button>Create Your Account</Button>
                </Link>
            </div>
        </div>
    );
}