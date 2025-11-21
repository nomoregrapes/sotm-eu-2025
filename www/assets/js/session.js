/**
 * Template Name: TheEvent
 * Template URL: https://bootstrapmade.com/theevent-conference-event-bootstrap-template/
 * Updated: Aug 07 2024 with Bootstrap v5.3.3
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */

(function() {
    "use strict";

    /**
     * Mobile nav toggle
     */
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

    function mobileNavToogle() {
        document.querySelector('body').classList.toggle('mobile-nav-active');
        mobileNavToggleBtn.classList.toggle('bi-list');
        mobileNavToggleBtn.classList.toggle('bi-x');
    }
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

    /**
     * Hide mobile nav on same-page/hash links
     */
    document.querySelectorAll('#navmenu a').forEach(navmenu => {
        navmenu.addEventListener('click', () => {
            if (document.querySelector('.mobile-nav-active')) {
                mobileNavToogle();
            }
        });

    });

    /**
     * Toggle mobile nav dropdowns
     */
    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
        navmenu.addEventListener('click', function(e) {
            e.preventDefault();
            this.parentNode.classList.toggle('active');
            this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
            e.stopImmediatePropagation();
        });
    });

    /**
     * Preloader
     */
    const preloader = document.querySelector('#preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.remove();
        });
    }

    /**
     * Initiate glightbox
     */
    const glightbox = GLightbox({
        selector: '.glightbox'
    });

    /**
     * Init swiper sliders
     */
    function initSwiper() {
        document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
            let config = JSON.parse(
                swiperElement.querySelector(".swiper-config").innerHTML.trim()
            );

            if (swiperElement.classList.contains("swiper-tab")) {
                initSwiperWithCustomPagination(swiperElement, config);
            } else {
                new Swiper(swiperElement, config);
            }
        });
    }

    window.addEventListener("load", initSwiper);



})();

/**
 * Functions for loading of session data
 */

async function get_session_data(code) {
    const url = "https://pretalx.com/sotmeu2025/schedule/export/schedule.json";

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load schedule JSON");

        const data = await response.json();

        if (!data.schedule || !Array.isArray(data.schedule.conference.days)) {
            console.error("Unexpected Pretalx JSON format", data);
            return null;
        }

        for (const day of data.schedule.conference.days) {
            if (!day.rooms || typeof day.rooms !== "object") continue;

            for (const roomName in day.rooms) {
                const sessions = day.rooms[roomName];
                if (!Array.isArray(sessions)) continue;

                for (const session of sessions) {
                    if (session.code === code) {
                        return session;
                    }
                }
            }
        }

        return null;  // no match found
    } catch (err) {
        console.error("Error loading session data:", err);
        return null;
    }
}

function buildSessionHTML(session) {
    const title = session.title || "Untitled session";
    const abstract = session.abstract || "";
    const description = session.description || "";
    const speakers = session.speakers || [];
    const start = session.start || "";
    const end = session.end || "";
    const room = session.room || "";
    const code = session.code;

    // Speaker block (Pretalx allows many speakers)
    const speakerHTML = speakers.map(sp => `
        <div class="pretalx-session">
            <div class="pretalx-session-time-box avatar">
                <a href="${sp.url}">
                    <div class="avatar-wrapper">
                        <img alt="speaker" loading="lazy" src="${sp.avatar}">
                    </div>
                </a>
            </div>
            <div class="pretalx-session-info">
                <div class="title"><a href="${sp.url}">${sp.name}</a></div>
                <div class="abstract"><p>${sp.biography || ""}</p></div>
            </div>
        </div>
    `).join("");

    return `
    <article>
        <h3 class="talk-title">
            <div class="heading-with-buttons">
                <span>
                    ${title}
                    <button class="btn btn-xs btn-link" id="fav-button">
                        <i class="fa fa-star-o" title="Favourite this session"></i>
                        <i class="fa fa-star d-none" title="Remove this session from your favourites"></i>
                    </button>
                </span>

                <div class="buttons d-flex justify-content-end" id="talk-buttons">
                    <a class="btn btn-outline-primary" href="/sotmeu2025/talk/${code}.ics">
                        <i class="fa fa-calendar"></i> .ical
                    </a>
                    <a class="btn btn-success ml-1" href="/sotmeu2025/talk/${code}/feedback/">
                        <i class="fa fa-comments"></i>
                    </a>
                </div>
            </div>

            <small class="text-muted">
                <span class="timerange-block">
                    ${start} – ${end}
                </span>,
                ${room}
            </small>
        </h3>

        <div class="talk row">
            <div class="talk-content">

                <section class="abstract">
                    <p>${abstract}</p>
                </section>

                <hr>

                <section class="description">
                    ${description}
                </section>

                <hr>

                <section class="answers">
                    <!-- You can add keywords and affiliation here if Pretalx JSON contains them -->
                </section>

                ${speakerHTML}
            </div>
        </div>
    </article>
    `;
}

// When page loads...
document.addEventListener("DOMContentLoaded", async () => {
    const code = window.location.hash.replace("#", "").trim();
    if (!code) return;

    const session = await get_session_data(code);

    if (!session) {
        document.querySelector("#session .container").innerHTML =
            `<p>Session not found.</p>`;
        return;
    }

    const html = buildSessionHTML(session);
    document.querySelector("#session .container").innerHTML = html;
});
