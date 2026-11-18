import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize, Minimize, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeckContent } from "../data/deck-lang-context";

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onToggleFullscreen,
  isFullscreen,
}: SlideNavigationProps) {
  const navigate = useNavigate();
  const { lang } = useDeckContent();

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        {!isFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "es" ? "Volver" : "Back"}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          disabled={currentSlide === 0}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={onToggleFullscreen}
        className="gap-1.5"
      >
        {isFullscreen ? (
          <>
            <Minimize className="h-4 w-4" />
            {lang === "es" ? "Salir" : "Exit"}
          </>
        ) : (
          <>
            <Maximize className="h-4 w-4" />
            {lang === "es" ? "Presentar" : "Present"}
          </>
        )}
      </Button>
    </div>
  );
}
