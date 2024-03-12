"use client";

import * as z from "zod";
import {useForm} from "react-hook-form";
import { useSearchParams } from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState, useTransition} from "react";
import {LoginSchema} from "@/schemas"
import Link from "next/link";
import {Input}  from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import {Button} from "@/components/ui/button";
import {FormError} from "@/components/form-error";
import {FormSucess} from "@/components/form-sucess";
import {login} from "@/actions/login";


export const LoginForm = () => {
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "You already have an account with this email.": "";
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [error, setError] = useState<string| undefined>("");
    const [success, setSuccess] = useState<string| undefined>("");

    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

 const onSubmit = (values: z.infer<typeof LoginSchema>) => {
     setError("");
     setSuccess("");
     startTransition(() => {
         login(values)
             .then((data) => {
                if (data?.error) {
                    form.reset();
                    setError(data.error);
                }

                if (data?.success) {
                    form.reset();
                    setSuccess(data.success);
                }

                if (data?.twoFactor) {
                    setShowTwoFactor(true);
                }
             }).catch(() => setError("Something went wrong!"));
     });
 }

    return (
        <CardWrapper
            headerLabel="Welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        {showTwoFactor && (
                            <FormField control={form.control} name="code" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Two Factor Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="123456"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}
                        {!showTwoFactor && (
                            <>
                                <FormField control={form.control} name="email" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                type="email"
                                                placeholder="john.doe@example.com"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="password" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            type="password"
                                            placeholder="******"
                                        />
                                    </FormControl>
                                    <Button size="sm" variant="link" asChild className="px-0 font-normal">
                                        <Link href="/auth/reset">
                                            Forgot password?
                                        </Link>
                                    </Button>
                                    <FormMessage />
                                </FormItem>
                                )}
                                />
                            </>
                        )}
                    </div>
                    <FormError message={error || urlError} />
                    <FormSucess message={success} />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {showTwoFactor ? "Confirm" : "Login"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}