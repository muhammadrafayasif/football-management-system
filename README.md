<p align="center">
	<img src="public/favicon.svg" alt="Football Management System logo" width="96" />
</p>

# Football Management System

<p align="center">
  <img src="https://img.shields.io/badge/Semester%20Project-Database%20Management%20Systems-white?style=for-the-badge&logo=postgresql" alt="Semester Project - Object Oriented Programming">
</p>

## Overview

Football Management System is a full-stack web application for managing a football club database. It combines a React + Vite frontend with a FastAPI backend connected to Supabase PostgreSQL, letting users browse and maintain football-related records from a single interface.

## What the application does

- Loads live data from the backend when the app starts.
- Displays summary counts for clubs, players, agents, sponsors, competitions, managers, contracts, and transfers.
- Lets users create, edit, and delete core records such as clubs and players.
- Supports football administration workflows including contracts, sponsorships, and transfers.
- Organizes the database into related entities such as people, clubs, managers, agents, sponsors, and competitions.
- Keeps the frontend synchronized with the database through API calls.

## Main areas

- Clubs: club profile, stadium details, budget, and squad management.
- Players: player identity, position, physical details, value, and club assignment.
- Agents: agency details, commission rate, and represented clients.
- Sponsors: company profiles and sponsorship information.
- Competitions: league and tournament records.
- Managers: coaching details and club links.
- Contracts: employment and sponsorship contracts with dates and status.
- Transfers: player movement history and transfer fees.

## Backend

The backend exposes REST endpoints for each entity and uses CORS to allow the frontend to communicate with the API. It also provides a health check and basic API metadata.

## Frontend

The frontend is a single-page application that fetches data from the API, shows database summaries, and provides forms and navigation for managing football records.

## Database

The data model is defined in `migration.sql` and is centered around football operations such as player profiles, club records, contracts, sponsorships, and transfers.
