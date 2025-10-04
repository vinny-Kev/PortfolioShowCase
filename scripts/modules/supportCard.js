document.addEventListener("DOMContentLoaded", () => {
    const supportCards = document.querySelectorAll(".support-card");

    const findExpansionForTrigger = (trigger) => {
        if (trigger.classList.contains("badge")) {
            const item = trigger.closest(".support-item");
            return item ? item.querySelector(".support-expansion") : null;
        }

        if (trigger.classList.contains("support-button")) {
            let pointer = trigger.nextElementSibling;
            while (pointer && !pointer.classList.contains("support-expansion")) {
                pointer = pointer.nextElementSibling;
            }
            return pointer;
        }

        return null;
    };

    supportCards.forEach((card) => {
        const expansions = card.querySelectorAll(".support-expansion");

        const setActiveExpansion = (activeExpansion) => {
            expansions.forEach((expansion) => {
                if (expansion === activeExpansion) {
                    expansion.classList.add("active");
                } else {
                    expansion.classList.remove("active");
                }
            });
        };

        const triggers = card.querySelectorAll(".badge, .support-button");

        triggers.forEach((trigger) => {
            const expansion = findExpansionForTrigger(trigger);
            if (!expansion) return;

            const activate = () => setActiveExpansion(expansion);

            trigger.addEventListener("mouseenter", activate);
            trigger.addEventListener("focus", activate);

            expansion.addEventListener("mouseenter", activate);
            expansion.addEventListener("focus", activate);
        });

        const resetExpansions = () => {
            expansions.forEach((expansion) => expansion.classList.remove("active"));
        };

        card.addEventListener("mouseleave", resetExpansions);
        card.addEventListener("focusout", (event) => {
            if (!card.contains(event.relatedTarget)) {
                resetExpansions();
            }
        });
    });
});