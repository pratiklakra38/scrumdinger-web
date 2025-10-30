# language: en

Feature: ScrumDinger Real-Time Meeting

  Scenario: User Login
    Given a registered user
    When they enter valid credentials and log in
    Then the dashboard loads without errors

  Scenario: User Signup with Google
    Given a new user
    When they sign up with Google
    Then an account is created and the dashboard is visible

  Scenario: Invite Team Members
    Given a registered user with team privileges
    When they invite members via link or code
    Then invited users should be listed in the team

  Scenario: Scrum Creation
    Given a user is logged in
    When they create a new scrum and assign members
    Then the scrum should appear in the scrum list

  Scenario: View Upcoming Scrums
    Given a logged-in user
    When they open Upcoming Scrums
    Then all scheduled scrums should be listed

  Scenario: Real-Time Meeting Integration
    Given multiple participants are connected
    When the meeting starts
    Then all users see live meeting updates

  Scenario: Timer for Speaker's Turn
    Given a meeting is in progress
    When the speaker changes
    Then the timer resets for the new speaker

  Scenario: Live Speaker Updates
    Given a meeting is active
    When a speaker starts speaking
    Then the current speaker's name appears active for all

  Scenario: Visual Timer Display
    Given a meeting is ongoing
    When the timer is running
    Then a visual countdown is displayed to all users

  Scenario: Record and Transcribe Audio
    Given recording is enabled
    When a participant stops recording
    Then a transcript should be auto-generated and saved for all

  Scenario: Meeting History & Archive
    Given a meeting has ended
    When a user views Meeting History
    Then the meeting's transcript and audio should be visible
