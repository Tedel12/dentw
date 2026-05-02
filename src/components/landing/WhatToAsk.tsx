import { MessageCircleIcon, MessageSquareIcon } from "lucide-react";
import Image from "next/image";

function WhatToAsk() {
  return (
    <section className="relative py-8 px-6 overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-full border border-primary/10 backdrop-blur-sm mb-6">
            <MessageCircleIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Conversations propulsées par l'IA</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Posez des questions sur
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              tout ce qui concerne le dentaire
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Des questions simples aux préoccupations complexes, notre IA fournit des conseils de niveau expert basés sur des milliers de cas dentaires réels
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Côté gauche - Exemples de chat interactif */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-8">Questions fréquentes auxquelles notre IA répond :</h3>

              {/* Bulle de chat 1 */}
              <div className="group relative">
                <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-3xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MessageSquareIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                        <p className="font-semibold text-primary">
                          "J'ai mal à une dent quand je mords"
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Obtenez des conseils immédiats sur la gestion de la douleur, les causes possibles et quand consulter un dentiste en urgence
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            Réponse instantanée
                          </span>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            Soulagement de la douleur
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulle de chat 2 */}
              <div className="group relative">
                <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-3xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MessageSquareIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                        <p className="font-semibold text-primary">
                          "Combien coûte un blanchiment des dents ?"
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Comparez les options de traitement, les fourchettes de prix et trouvez la meilleure solution de blanchiment adaptée à votre budget
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            Analyse des coûts
                          </span>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            Options de traitement
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulle de chat 3 */}
              <div className="group relative">
                <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-3xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MessageSquareIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                        <p className="font-semibold text-primary">
                          "Quand devrais-je remplacer mon plombage ?"
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Découvrez la durée de vie d'un plombage, les signes d'usure et des conseils sur le moment de le remplacer
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            Soins préventifs
                          </span>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            Entretien
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Côté droit - Illustration IA */}
          <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500">
            <div className="flex items-center justify-center h-full">
              <Image
                src="/confused.png"
                alt="Assistant IA"
                width={500}
                height={500}
                className="w-full h-auto max-w-lg object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default WhatToAsk;
