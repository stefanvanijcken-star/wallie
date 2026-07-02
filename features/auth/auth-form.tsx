"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Loader2, LogIn, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { WallieLogo } from "@/components/wallie-logo"
import { createClient } from "@/lib/supabase/client"

type AuthMode = "login" | "register"

type AuthFormProps = {
  mode: AuthMode
}

const authCopy: Record<
  AuthMode,
  {
    title: string
    description: string
    submitLabel: string
    footerLabel: string
    footerHref: string
    footerLink: string
  }
> = {
  login: {
    title: "Inloggen",
    description: "Open je Wallie dashboard en ga verder met je spaarpotten.",
    submitLabel: "Inloggen",
    footerLabel: "Nog geen account?",
    footerHref: "/register",
    footerLink: "Account maken",
  },
  register: {
    title: "Account maken",
    description:
      "Maak je Wallie account aan. Je data koppelen we hierna stap voor stap.",
    submitLabel: "Account maken",
    footerLabel: "Heb je al een account?",
    footerHref: "/login",
    footerLink: "Inloggen",
  },
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const copy = authCopy[mode]
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRegister = mode === "register"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim() || null,
            },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })

        if (error) {
          throw error
        }

        if (data.session) {
          toast.success("Account aangemaakt")
          router.replace("/")
          router.refresh()
          return
        }

        toast.success("Account aangemaakt. Check je e-mail om te bevestigen.")
        router.replace("/login")
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast.success("Je bent ingelogd")
      router.replace("/")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Inloggen of registreren is niet gelukt"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/70 shadow-sm">
      <CardHeader className="gap-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
          <WallieLogo className="h-6 w-8" />
        </div>
        <div className="grid gap-1">
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <div className="grid gap-2">
              <Label htmlFor="display-name">Naam</Label>
              <Input
                autoComplete="name"
                id="display-name"
                onChange={(event) => setDisplayName(event.target.value)}
                value={displayName}
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              autoComplete="email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              autoComplete={isRegister ? "new-password" : "current-password"}
              id="password"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : isRegister ? (
              <UserPlus data-icon="inline-start" />
            ) : (
              <LogIn data-icon="inline-start" />
            )}
            {copy.submitLabel}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {copy.footerLabel}{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={copy.footerHref}
          >
            {copy.footerLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
