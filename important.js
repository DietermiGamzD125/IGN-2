import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://sitsladcfazfbqyrnvby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdHNsYWRjZmF6ZmJxeXJudmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMjU1NDMsImV4cCI6MjA5MzcwMTU0M30.pnptoZXK5aw1fl713PFoJTqMgSSgcNPUhJiCqK50kg8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initGames() {
    const container = document.getElementById('games-container');

    if (!container) {
        console.error("Could not find #games-container");
        return;
    }

    try {

        // Get all games
        const { data: games, error } = await supabase
            .from('Games')
            .select('*');

        if (error) {
            throw error;
        }

        container.innerHTML = '';

        // Loop through games
        for (const game of games) {

            // Get average review score for this game
            const { data: reviews, error: reviewError } = await supabase
                .from('Reviews') // change if your table has another name
                .select('score')
                .eq('game_id', game.id);

            if (reviewError) {
                console.error(reviewError);
            }

            let average = 'No reviews';

            if (reviews && reviews.length > 0) {
                const total = reviews.reduce((sum, review) => sum + review.score, 0);
                average = (total / reviews.length).toFixed(1);
            }

            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${game.image}" alt="${game.name}">
                </div>

                <div class="card-content">
                    <h3>${game.name}</h3>

                    <p class="average-score">
                         ${average}/10
                    </p>

                    <button onclick="openGame(${game.id})">
                        View Details
                    </button>
                </div>
            `;

            container.appendChild(card);
        }

    } catch (err) {

        console.error(err);

        container.innerHTML =
            `<p>Failed to load games.</p>`;
    }
}

window.openGame = function(id) {
    window.location.href = `game.html?id=${id}`;
}

document.addEventListener('DOMContentLoaded', initGames);