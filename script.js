const timeNode = document.querySelector("#local-time");
const hoverVideos = document.querySelectorAll(".media-link video");
const thinkingTargets = document.querySelectorAll("a, button");
const beforeAfterSliders = document.querySelectorAll("[data-before-after]");
const zoomableImages = Array.from(document.querySelectorAll(".case-detail img"))
  .filter((image) => !image.closest("a") && !image.closest("[data-no-lightbox]") && !image.classList.contains("no-lightbox"));
const scrollHintStrips = document.querySelectorAll(".case-image-strip, .case-more__grid");
const canUseFinePointer = window.matchMedia("(pointer: fine)").matches;
const mobileVideoQuery = window.matchMedia("(max-width: 780px), (hover: none), (pointer: coarse)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const thinkingCursor = canUseFinePointer ? document.createElement("div") : null;
let thinkingStartTime = 0;
let thinkingTimer = 0;
let thinkingDelay = 0;
let imageLightbox = null;

if (thinkingCursor) {
  thinkingCursor.className = "thinking-cursor";
  thinkingCursor.setAttribute("aria-hidden", "true");
  document.body.append(thinkingCursor);
}

function updateLocalTime() {
  if (!timeNode) {
    return;
  }

  const now = new Date();
  const value = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  timeNode.textContent = value;
  timeNode.dateTime = now.toISOString();
}

function setupHoverVideos() {
  const resetVideo = (video) => {
    try {
      video.currentTime = 0;
    } catch {
    }
  };

  const syncMobileVideoMode = () => {
    hoverVideos.forEach((video) => {
      const mediaLink = video.closest(".media-link");

      if (!mediaLink) {
        return;
      }

      if (mobileVideoQuery.matches) {
        video.preload = "auto";
        mediaLink.classList.add("is-video-active");
        video.play().catch(() => {
        });
        return;
      }

      video.pause();
      resetVideo(video);
      mediaLink.classList.remove("is-video-active");
    });
  };

  hoverVideos.forEach((video) => {
    const mediaLink = video.closest(".media-link");
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    if (!mediaLink) {
      return;
    }

    mediaLink.addEventListener("mouseenter", () => {
      if (mobileVideoQuery.matches) {
        return;
      }

      resetVideo(video);
      mediaLink.classList.add("is-video-active");
      video.play().catch(() => {
        mediaLink.classList.remove("is-video-active");
      });
    });

    mediaLink.addEventListener("mouseleave", () => {
      if (mobileVideoQuery.matches) {
        return;
      }

      video.pause();
      resetVideo(video);
      mediaLink.classList.remove("is-video-active");
    });
  });

  syncMobileVideoMode();

  if (typeof mobileVideoQuery.addEventListener === "function") {
    mobileVideoQuery.addEventListener("change", syncMobileVideoMode);
  } else {
    mobileVideoQuery.addListener(syncMobileVideoMode);
  }
}

function setupThinkingCursor() {
  if (!thinkingCursor) {
    return;
  }

  const renderCursorText = (value) => {
    thinkingCursor.replaceChildren();

    value.split("").forEach((letter, index) => {
      const span = document.createElement("span");
      span.textContent = letter === " " ? "\u00a0" : letter;
      span.style.setProperty("--letter-index", index);
      thinkingCursor.append(span);
    });
  };

  const updateWorkedText = () => {
    const seconds = Math.max(2, Math.floor((Date.now() - thinkingStartTime) / 1000));
    renderCursorText(`Worked for ${seconds}s...`);
  };

  const updateCursor = (event) => {
    thinkingCursor.style.setProperty("--cursor-x", `${event.clientX}px`);
    thinkingCursor.style.setProperty("--cursor-y", `${event.clientY}px`);
  };

  thinkingTargets.forEach((target) => {
    target.addEventListener("mouseenter", (event) => {
      thinkingStartTime = Date.now();
      clearTimeout(thinkingDelay);
      clearInterval(thinkingTimer);
      renderCursorText("Thinking...");
      thinkingDelay = setTimeout(() => {
        updateWorkedText();
        thinkingTimer = setInterval(updateWorkedText, 1000);
      }, 2000);

      document.body.classList.add("is-thinking");
      updateCursor(event);
    });

    target.addEventListener("mousemove", updateCursor);

    target.addEventListener("mouseleave", () => {
      clearTimeout(thinkingDelay);
      clearInterval(thinkingTimer);
      document.body.classList.remove("is-thinking");
    });
  });
}

function setupScrollHintStrips() {
  if (!scrollHintStrips.length || reducedMotionQuery.matches) {
    return;
  }

  const nudgeStrip = (strip) => {
    const maxScroll = strip.scrollWidth - strip.clientWidth;

    if (maxScroll <= 0 || strip.dataset.hintPlayed === "true") {
      return;
    }

    strip.dataset.hintPlayed = "true";
    const hintDistance = Math.min(160, maxScroll * 0.18);

    window.setTimeout(() => {
      strip.scrollTo({
        left: hintDistance,
        behavior: "smooth",
      });

      window.setTimeout(() => {
        strip.scrollTo({
          left: Math.max(0, hintDistance * 0.45),
          behavior: "smooth",
        });
      }, 760);
    }, 240);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        nudgeStrip(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.35,
    });

    scrollHintStrips.forEach((strip) => observer.observe(strip));
    return;
  }

  scrollHintStrips.forEach(nudgeStrip);
}

function setupBeforeAfterSliders() {
  beforeAfterSliders.forEach((slider) => {
    const range = slider.querySelector(".before-after__range");

    if (!range) {
      return;
    }

    const setPosition = (value) => {
      const position = Math.min(100, Math.max(0, Number(value)));
      slider.style.setProperty("--position", `${position}%`);
      range.value = String(position);
    };

    range.addEventListener("input", () => setPosition(range.value));
    range.addEventListener("change", () => setPosition(range.value));
    setPosition(range.value);
  });
}

function setupNoDanglingShortWords() {
  const contentRoot = document.querySelector("main");

  if (!contentRoot) {
    return;
  }

  const shortWordPattern = /(^|[\s([{«„"“])([АаВвИиКкОоСсУуЯя]|[Бб]ез|[Вв]о|[Дд]о|[Дд]ля|[Зз]а|[Ии]з|[Кк]ак|[Мм]ы|[Нн]а|[Нн]е|[Нн]о|[Оо]б|[Оо]т|[Пп]о|[Пп]ри|[Пп]ро|[Сс]о|[Чч]то|[Ээ]то)\s+/g;
  const walker = document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    node.nodeValue = node.nodeValue.replace(shortWordPattern, "$1$2\u00a0");
  });
}

function setupImageLightbox() {
  if (!zoomableImages.length) {
    return;
  }

  const closeLightbox = () => {
    if (!imageLightbox) {
      return;
    }

    const currentLightbox = imageLightbox;
    currentLightbox.classList.remove("is-open");
    document.body.classList.remove("is-lightbox-open");
    window.setTimeout(() => {
      currentLightbox.remove();

      if (imageLightbox === currentLightbox) {
        imageLightbox = null;
      }
    }, 180);
  };

  const openLightbox = (image) => {
    closeLightbox();

    imageLightbox = document.createElement("div");
    imageLightbox.className = "image-lightbox";
    imageLightbox.setAttribute("role", "dialog");
    imageLightbox.setAttribute("aria-modal", "true");
    imageLightbox.setAttribute("aria-label", image.alt || "Увеличенное изображение");

    const lightboxImage = document.createElement("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "";
    lightboxImage.decoding = "async";

    const closeButton = document.createElement("button");
    closeButton.className = "image-lightbox__close";
    closeButton.type = "button";
    closeButton.textContent = "Закрыть";
    closeButton.setAttribute("aria-label", "Закрыть увеличенное изображение");
    closeButton.addEventListener("click", closeLightbox);

    imageLightbox.append(lightboxImage, closeButton);
    imageLightbox.addEventListener("click", (event) => {
      if (event.target === imageLightbox) {
        closeLightbox();
      }
    });

    document.body.append(imageLightbox);
    document.body.classList.add("is-lightbox-open");
    window.requestAnimationFrame(() => {
      imageLightbox.classList.add("is-open");
      closeButton.focus({ preventScroll: true });
    });
  };

  zoomableImages.forEach((image) => {
    image.classList.add("is-zoomable-image");
    image.addEventListener("click", () => openLightbox(image));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}

setupHoverVideos();
setupThinkingCursor();
setupScrollHintStrips();
setupBeforeAfterSliders();
setupNoDanglingShortWords();
setupImageLightbox();
updateLocalTime();
setInterval(updateLocalTime, 30_000);
