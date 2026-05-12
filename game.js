import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://sitsladcfazfbqyrnvby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdHNsYWRjZmF6ZmJxeXJudmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMjU1NDMsImV4cCI6MjA5MzcwMTU0M30.pnptoZXK5aw1fl713PFoJTqMgSSgcNPUhJiCqK50kg8';

const supabase = createClient(supabaseUrl, supabaseKey);

const params = new URLSearchParams(window.location.search);

const gameId = params.get('id');

const reviewForm =
    document.getElementById('review-form');

const formMessage =
    document.getElementById('form-message');

function timeAgo(dateString) {

    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];

    const rtf = new Intl.RelativeTimeFormat('en', {
        numeric: 'auto'
    });

    for (const interval of intervals) {

        const count = Math.floor(seconds / interval.seconds);

        if (count >= 1) {
            return rtf.format(-count, interval.label);
        }
    }

    return 'just now';
}

async function loadGame() {

    // Load game
    const { data: game } = await supabase
        .from('Games')
        .select('*')
        .eq('id', gameId)
        .single();

    document.getElementById('game-title').textContent =
        game.name;

    // Load reviews
    const { data: reviews, error } = await supabase
        .from('Reviews')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

    console.log(reviews);

    const averageElement =
        document.getElementById('average-score');

    if (reviews.length > 0) {

    const total =
        reviews.reduce((sum, review) => {
            return sum + review.score;
        }, 0);

    const average = total / reviews.length;

    averageElement.textContent =
        `${average.toFixed(1)}/10`;

    } else {

    averageElement.textContent =
        'No reviews yet';
    }

    const container =
        document.getElementById('reviews-container');

    container.innerHTML = '';

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <h4>${review.name}</h4>
            <h3>${review.score}/10</h3>
            <p>${review.text}</p>
            <small>${timeAgo(review.created_at)}</small>
            `;

        container.appendChild(card);
    });

}

async function submitReview(event) {

    event.preventDefault();

    const name =
        document.getElementById('review-name').value;

    const score =
        parseInt(document.getElementById('review-score').value);

    const text =
        document.getElementById('review-text').value;

    const { error } = await supabase
        .from('Reviews')
        .insert([
            {
                game_id: gameId,
                name,
                score,
                text
            }
        ]);

    if (error) {

        console.error(error);

        formMessage.textContent =
            'Failed to submit review';

        return;
    }

    formMessage.textContent =
        'Review submitted!';

    reviewForm.reset();

    document.getElementById('reviews-container').innerHTML = '';

    loadGame();
}

reviewForm.addEventListener(
    'submit',
    submitReview
);

loadGame();