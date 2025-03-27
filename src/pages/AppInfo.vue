<template>
    <div class="bg-gray-100 min-h-screen p-4">
        <div class="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-6">
            <h2 class="text-2xl font-semibold mb-4">How Footie Predictors Works</h2>

            <div class="mb-8">
                <p>This short guide will give you all the knowledge you need to get up and running on our app!</p>
            </div>

            <div class="mb-4">
                <p class="text-lg font-semibold">1. Creating a Group</p>
                <ul class="list-disc pl-5">
                    <li>To start using the app, you must first join or <router-link to="/create-group" class="text-blue-600 hover:underline">create a group</router-link>.</li>
                    <li>By creating your own group, you decide on things like the scoring system for gameweek predictions, the maximum amount of members, and whether your group is private or public.</li>
                    <li>Once you have created your group, click the 'share' button to copy the gameweek link. This will take people straight to your group so they can join.</li>
                </ul>
            </div>

            <div class="mb-4">
                <p class="text-lg font-semibold">2. Joining a Group</p>
                <ul class="list-disc pl-5">
                    <li>Private groups require a PIN to enter, whereas anyone can join and predict in a public group.</li>
                    <li>If you join someone else's group, you make predictions for matches in gameweeks created by the admin (creator) of the group.</li>
                    <li>If you are the admin of a group, you control the gameweeks and matches within them, which yourself and members of your group make predictions for.</li>
                </ul>
            </div>

            <div class="mb-4">
                <p class="text-lg font-semibold">3. Creating a Gameweek</p>
                <ul class="list-disc pl-5">
                    <li>Once you have created a group, you (the admin) are responsible for creating gameweeks for you and your group members to make predictions for.</li>
                    <li>Only one gameweek can be 'active' at any given time within a group, and predictions can only be made for the active gameweek.</li>
                    <li>Each gameweek needs a deadline. This is the point at which the gameweek will lock, and predictions can no longer be made.</li>
                    <li>Add matches to the gameweek by using our third-party API <a href="https://www.football-data.org/" class="text-blue-600 hover:underline">football-data.org</a> to get real upcoming matches, or add custom matches.</li>
                    <li>Real matches' scores will be automatically updated after the matches finish, whereas custom matches require the admin to enter final scores.</li>
                </ul>
            </div>

            <div class="mb-4">
                <p class="text-lg font-semibold">4. Predicting Match Scores</p>
                <ul class="list-disc pl-5">
                    <li>Once the gameweek is set up with matches, group members can make predictions for the match scores.</li>
                    <li>You can edit your predictions any time up until the gameweek deadline, or until the admin locks the gameweek. After this, your predictions are locked in!</li>
                    <li>Once the gameweek is locked, you can view everyone else's predictions to see what scores your friends have chosen.</li>
                </ul>
            </div>

            <div class="mb-4">
                <p class="text-lg font-semibold">5. Marking Predictions</p>
                <ul class="list-disc pl-5">
                    <li>Once real matches have finished, their scores are saved, and the predictions for those matches are marked based on the scoring system set by the admin when they created the group.</li>
                    <li>Likewise, once the admin has entered scores for custom matches, predictions for those matches are marked.</li>
                    <li>You gain points for predicting an exact correct score or the correct result. You may lose points for incorrect results depending on the group scoring system, so pick carefully!</li>
                </ul>
            </div>

            <div class="mb-4">
                <p class="text-lg font-semibold">6. Group Leaderboard</p>
                <ul class="list-disc pl-5">
                    <li>After each match's final scores have been saved and the predictions for them have been marked, the gameweek leaderboard is updated with everyone's scores.</li>
                    <li>Once all matches in the gameweek have finished and everyone's predictions have been marked, the gameweek winner is announced. This can be found on the gameweek's page.</li>
                    <li>Members' scores from the gameweek are added to the main group's all-time leaderboard, which can be found on the group's page and shows the total points for each member across all gameweeks.</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>
