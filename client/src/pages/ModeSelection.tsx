import { Code2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ModeSelectionProps {
  onSelectMode: (mode: "ai" | "manual") => void;
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <h1 className="text-base font-semibold">CodeStudio</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Comment voulez-vous créer?</h2>
            <p className="text-muted-foreground text-lg">
              Choisissez votre mode de travail préféré
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2"
              onClick={() => onSelectMode("ai")}
              data-testid="card-mode-ai"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Mode IA</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Créez avec des prompts en langage naturel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Décrivez ce que vous voulez et l'IA créera tout pour vous : fichiers HTML, CSS, JavaScript, design complet.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Création de sites web complets en quelques secondes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Modifications et corrections automatiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Suggestions de code intelligentes</span>
                  </li>
                </ul>
                <Button className="w-full gap-2" size="lg">
                  <Sparkles className="h-4 w-4" />
                  Commencer avec l'IA
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2"
              onClick={() => onSelectMode("manual")}
              data-testid="card-mode-manual"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Mode Éditeur</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Codez manuellement dans l'éditeur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Contrôle total sur votre code avec Monaco Editor (éditeur VS Code). Parfait pour les développeurs expérimentés.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Éditeur de code professionnel avec coloration syntaxique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Aperçu en temps réel de votre travail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Gestion complète des fichiers</span>
                  </li>
                </ul>
                <Button className="w-full gap-2" variant="secondary" size="lg">
                  <Code2 className="h-4 w-4" />
                  Ouvrir l'éditeur
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Vous pourrez toujours basculer entre les modes plus tard
          </p>
        </div>
      </main>
    </div>
  );
}
