# Operation Vr 21 Holdem Project Plan

Operation VR — Full Project Plan for 21 Hold’em WebXR

Project: 21 Hold’em VR / WebXR Table PrototypeOwner: Big Slick GamesPrimary builder: Brent — 3D models, creative direction, scene layout, product decisionsBuild style: VSCode + Codex + Web App + WebXR + micro-freelancer chunksTarget: Quest Browser first, desktop 3D fallback secondCore idea: Build many small pieces that look boring alone, then assemble them into a playable 21 Hold’em VR table.

0. Project Philosophy

This project must not be built as one giant “make me VR poker” job.

That is how projects get expensive, slow, messy, and impossible to control.

The correct strategy is to break 21 Hold’em VR into many small, testable parts. Each part should be simple enough that a cheap freelancer, Codex, or a focused coding session can complete it without needing the whole vision.

The goal is not to hire someone to understand Big Slick Games.

The goal is to buy or build reusable parts:

a 3D table scene

a seat system

a card component

a chip component

a button panel

a betting zone

a pot animation

a VR pointer

a fake round flow

a WebXR launch button

a backend state adapter

Each piece should work in isolation.

Then the best pieces get assembled into the real prototype.

This plan assumes Brent handles the 3D art and modelling, because that is a major strength. Freelancers and Codex should be used mainly for technical wiring, WebXR setup, React/Three components, state management, animation logic, and integration.

The guiding principle is:

Brent builds the world. Codex and freelancers wire the electricity.

1. Final Target

The first serious milestone is not a full multiplayer casino.

The target is a playable WebXR vertical slice of 21 Hold’em.

A player should be able to:

Open a web page.

See a 3D 21 Hold’em table on desktop.

Enter VR through Quest Browser.

Sit at a table position.

See cards, chips, nameplates, and betting zones.

Use VR controller rays to press action buttons.

Play through a scripted or local fake round.

See cards deal, community cards reveal, chips move into the pot, and a showdown result display.

This first build does not need live multiplayer.

Live multiplayer should come after the table, buttons, cards, chips, and round flow feel good.

2. Recommended Technical Stack

Core Web App

Use:

ViteReactTypeScriptThree.jsReact Three Fiber@react-three/xr@react-three/dreiZustandFramer Motion or GSAP for flat UI where neededSocket.io or Colyseus later for multiplayer

Why this stack

This stack keeps the project inside VSCode and works naturally with Codex.

React handles normal UI, menus, state panels, and page structure.

Three.js and React Three Fiber handle the 3D table.

WebXR allows Quest Browser to enter VR without building a native Quest app.

Zustand is useful because the game table needs a clear state store, but full Redux would be overkill at this stage.

Folder structure

Start with this shape:

operation-vr/ docs/ project-plan.md asset-list.md freelancer-jobs.md prompts/ public/ models/ textures/ audio/ src/ app/ components/ ui/ vr/ table/ cards/ chips/ players/ betting/ effects/ game/ rules/ mockData/ state/ types/ scenes/ TableScene.tsx LobbyScene.tsx styles/ main.tsx package.json

This matters because a messy folder structure kills Codex usefulness. Codex performs better when files have obvious names and clear boundaries.

3. Build Phases Overview

Phase 1 — Planning and setup

Create the web project, install dependencies, add a blank 3D scene, add WebXR entry, and confirm Quest Browser can open it.

Phase 2 — Brent asset production

Model and export the basic VR table assets: table, seats, chips, cards, table zones, lobby shell, signage, and simple props.

Phase 3 — Static 3D table scene

Import Brent’s models into the web app and build a clean desktop 3D scene.

Phase 4 — WebXR interaction foundation

Add Enter VR, controller rays, gaze/controller selection, and basic button interaction.

Phase 5 — Seat and player presentation

Add 9 seats, active player location, nameplates, badges, chip counts, and player states.

Phase 6 — Cards and dealing

Add card components, card face switching, hole card placement, community cards, flip animations, and deal animations.

Phase 7 — Chips, betting zones, and pot movement

Add chip stacks, betting zones, pot display, chip movement into the pot, and winner payout animations.

Phase 8 — Action buttons and local fake game state

Add legal action panels, mock state, scripted turns, Confirm/Stand/Call/Raise/Fold buttons, and UI wording based on the official rules.

Phase 9 — Scripted playable vertical slice

Create a fake but convincing 21 Hold’em hand that demonstrates the game loop.

Phase 10 — Backend connection planning

Map the WebXR frontend to the existing 21 Hold’em backend events and state fields.

Phase 11 — Real multiplayer prototype

Only after the local vertical slice feels good, connect live state, table joining, player turns, and real actions.

Phase 12 — Polish, optimisation, and demo packaging

Improve performance, load time, Quest comfort, visual polish, and create a shareable demo build.

4. Phase 1 — Planning and Project Setup

Goal

Create the base WebXR project and prove it can run in browser and open on Quest.

This phase should happen before modelling too much. There is no point making a huge beautiful room if the base WebXR project is not working.

Tasks for Brent

Create a new folder called operation-vr.

Open it in VSCode.

Use Codex to create the Vite React TypeScript app.

Install the 3D/WebXR dependencies.

Run the app locally.

Deploy a basic test page to a secure HTTPS URL.

Open it on Quest Browser and confirm the page loads.

VSCode / Codex Prompt 1 — Create the project

Create a new Vite React TypeScript project for a WebXR 21 Hold’em VR prototype.Use this stack:- React- TypeScript- Vite- Three.js- React Three Fiber- @react-three/drei- @react-three/xr- ZustandSet up a clean folder structure:- src/components/vr- src/components/table- src/components/cards- src/components/chips- src/components/players- src/components/betting- src/game/state- src/game/types- src/game/mockData- src/scenesCreate a basic App.tsx that renders a full-screen 3D canvas with a simple floor, light, camera, and a placeholder table object.Add comments for beginner-safe edit areas.Do not add multiplayer yet.Do not add backend calls yet.Keep the project clean and minimal.

VSCode / Codex Prompt 2 — Add WebXR entry

Add WebXR support to this React Three Fiber project using @react-three/xr.Requirements:- Add an Enter VR button.- Keep desktop mode working normally.- Add a simple VR scene with a floor, table placeholder, and controller ray interaction foundation.- Add comments explaining which files control WebXR setup.- Keep the implementation simple and Quest Browser friendly.Do not add game logic yet.Do not add multiplayer yet.

Acceptance test

This phase is complete when:

the app runs on desktop

a 3D scene is visible

there is an Enter VR button

the page can be opened on Quest Browser

entering VR does not immediately crash

Rough time

1–3 days.

Freelancer option

If setup becomes annoying, hire a WebXR/React Three Fiber freelancer.

Micro-job title:

React Three Fiber WebXR starter scene for Quest Browser

Budget: $50–$150

5. Phase 2 — Brent Asset Production

Goal

Create simple, clean, Quest-friendly 3D assets for the first table scene.

Do not over-detail yet. The first assets should be good enough to test layout, scale, and mood. The final art pass comes later.

Asset rule

Every model should be built for performance.

Quest Browser will not like heavy geometry, massive textures, or ten shiny objects using expensive materials.

Prefer:

clean low-poly or mid-poly models

baked details where possible

simple materials

compressed textures

GLB/GLTF export

sensible scale

pivot points in useful places

Model this first, in this order

1. Poker / blackjack hybrid table

Create the main table first because every other object depends on it.

It should have:

9 player positions

1 dealer side or dealer zone

centre pot zone

community card zone

visible betting zones

enough spacing for VR readability

simple geometry

The table does not need final luxury polish yet. It needs correct scale and clean layout.

2. Seat markers

Do not model full chairs first unless you want them visually.

For the prototype, seat markers can be subtle glowing pads, rings, plaques, or small position markers.

The important part is that each seat has a known anchor point.

Name them clearly:

Seat_01Seat_02Seat_03Seat_04Seat_05Seat_06Seat_07Seat_08Seat_09

3. Card models

Create a simple card model.

You only need:

front surface

back surface

slight thickness

clean UVs

readable size

Do not create 52 separate card meshes. Create one card mesh and let the web app swap textures or display labels.

4. Chip models

Create a clean chip model.

Use low-poly geometry. Do not overdo bevels. The prototype can use stacked chip instances.

Create a few base colours if you want, but keep them simple.

5. Betting zone markers

Create subtle markers or table areas for each player’s bet.

These can be built into the table texture or separate flat meshes.

Name them:

BetZone_01BetZone_02...BetZone_09

6. Centre pot area

Create a visible centre zone where chips gather.

Name it:

PotZone_Center

7. Community card slots

Create 5 clear card slots in the middle of the table.

Name them:

CommunitySlot_01CommunitySlot_02CommunitySlot_03CommunitySlot_04CommunitySlot_05

8. Player hand card slots

Create simple reference positions for player cards.

For early prototype, only your own player seat needs detailed visible hand layout. Other players can have simplified cards on table.

9. Lobby shell

Only after the table scene is working, model a simple lobby or surrounding room.

Do not make the lobby first. The table is the product.

Export rules

Export as:

.glb

Recommended filenames:

vr_table_v01.glbvr_card_v01.glbvr_chip_v01.glbvr_lobby_shell_v01.glb

Keep versions:

v01 = layout testv02 = improved scalev03 = visual polish

Brent checklist before import

Before taking models into VSCode:

freeze/apply transforms

set origin/pivot sensibly

check scale

remove hidden geometry

reduce unnecessary bevels

use clear object names

export GLB

keep source file backups

VSCode / Codex Prompt 3 — Import Brent’s models

I have exported these GLB models into public/models:- vr_table_v01.glb- vr_card_v01.glb- vr_chip_v01.glbCreate React Three Fiber components to load and display them:- TableModel.tsx- CardModel.tsx- ChipModel.tsxUse @react-three/drei useGLTF.Place the table at the centre of the scene.Place one sample card on the table.Place one sample chip stack near the pot area.Add simple fallback placeholder geometry if a model fails to load.Add comments explaining where to change position, rotation, and scale.Keep everything beginner-friendly.

Acceptance test

This phase is complete when:

the table model appears in desktop browser

the card model appears

the chip model appears

scale feels roughly correct

the scene still runs smoothly

Rough time

3–10 days depending on how polished you want the models.

6. Phase 3 — Static 3D Table Scene

Goal

Turn the imported models into a usable table layout.

This is still not a game. This is the stage where the table becomes readable, comfortable, and organised.

Tasks

Create a TableScene.tsx.

Add the main table model.

Add 9 seat positions as data.

Add 9 bet zones as data.

Add 5 community card slots.

Add centre pot location.

Add placeholder nameplates.

Add basic camera controls for desktop.

Add basic lights.

Add performance stats in dev mode.

Data-first layout

Do not hardcode every object randomly inside JSX.

Use arrays like:

const seatPositions = [ { id: 1, position: [0, 1, 2], rotation: [0, 0, 0] }, { id: 2, position: [1, 1, 1.5], rotation: [0, 0, 0] },]

This makes it much easier for Codex, freelancers, and future backend state to use the table.

VSCode / Codex Prompt 4 — Create table layout data

Create a data-driven table layout system for the 21 Hold’em WebXR prototype.Requirements:- Create src/game/types/tableTypes.ts- Define types for SeatAnchor, BetZoneAnchor, CardSlotAnchor, and PotAnchor.- Create src/game/mockData/tableLayout.ts with: - 9 seat anchors - 9 bet zone anchors - 5 community card slots - 1 centre pot anchor- Update TableScene.tsx to render visible placeholder markers for each anchor.- Each marker should have a small label for debugging, such as Seat 1, Bet 1, Community 1.- Add a toggle to hide/show debug markers.Keep this simple and well-commented.Do not add real game logic yet.

VSCode / Codex Prompt 5 — Make scene readable

Improve the TableScene readability for desktop and Quest Browser testing.Requirements:- Add a simple floor.- Add soft but performance-friendly lighting.- Add a camera angle that shows the whole table in desktop mode.- Add OrbitControls for desktop testing only.- Keep VR mode compatible.- Add comments explaining which values control camera distance, table scale, and lighting.Do not add heavy post-processing.Do not add expensive shadows unless they are optional and off by default.

Acceptance test

This phase is complete when:

the table looks organised

seat numbers are visible in debug mode

card slots are visible in debug mode

bet zones are visible in debug mode

you can explain where every gameplay object will appear

Rough time

2–5 days.

Freelancer option

Micro-job title:

React Three Fiber poker table anchor layout system

Budget: $50–$150

7. Phase 4 — WebXR Interaction Foundation

Goal

Make the Quest controllers interact with simple 3D UI.

This phase is not about gameplay. It is about proving that a player can point at things and press them in VR.

Tasks

Add XR controller support.

Add ray pointer interaction.

Add a test button in 3D space.

Pressing the button changes text or state.

Add hover feedback.

Add click feedback.

Test on desktop and Quest.

Rule

Use pointer/ray interaction first.

Do not start with physical hand grabbing. It looks cool, but it adds complexity too early. Controller ray buttons are enough for a first playable VR table.

VSCode / Codex Prompt 6 — VR pointer button test

Create a simple VR pointer interaction test for the WebXR table.Requirements:- Add a floating 3D button in front of the table.- The button should be clickable with mouse on desktop.- The button should be selectable with XR controller ray in VR.- On hover, slightly scale the button or change its material.- On click/select, update a visible text label from "Not clicked" to "Clicked".- Put this in src/components/vr/VRButtonTest.tsx.- Keep the code beginner-friendly and commented.Do not add real 21 Hold’em actions yet.This is only an interaction proof.

VSCode / Codex Prompt 7 — Reusable VR button component

Turn the VR button test into a reusable component called VRButton.Requirements:- File: src/components/vr/VRButton.tsx- Props: - label - position - disabled - onClick - variant optional- Support hover state.- Support disabled visual state.- Work with desktop mouse and XR controller interaction.- Add comments explaining how to use it.Then update the test scene to render three buttons using this component.

Acceptance test

This phase is complete when:

a Quest controller ray can select a button

button hover is visible

button click changes state

the same button can be tested on desktop

Rough time

2–5 days.

Freelancer option

Micro-job title:

Reusable React Three Fiber WebXR button component with Quest controller ray support

Budget: $75–$250

This is worth paying more for if needed, because every action button depends on it.

8. Phase 5 — Seat System

Goal

Allow a player to choose a seat and move the camera/player view to that table position.

This should still be local only. No backend. No multiplayer.

Tasks

Render 9 seat buttons or markers.

Let player select a seat.

Store selected seat in Zustand.

Move desktop camera to that seat view.

In VR, reposition the XR reference/origin if possible, or adjust table/player anchor behaviour.

Mark the selected seat as occupied.

Show empty/occupied visual states.

Important design choice

For WebXR, camera control is different from normal desktop camera control because the headset controls the camera orientation. You should not fight the headset camera.

Instead, think in terms of placing the player rig or scene origin at the selected seat.

For the prototype, it is acceptable to fake this with a seat-focused table position and a clear selected-seat indicator before attempting perfect XR rig repositioning.

VSCode / Codex Prompt 8 — Local seat selection

Create a local seat selection system for the 21 Hold’em WebXR table.Requirements:- Use the existing 9 seat anchors from tableLayout.ts.- Render a clickable/selectable marker for each seat.- When a seat is selected, save selectedSeatId in a Zustand store.- Change that seat’s visual state to occupied/selected.- Show a floating label: "You are seated at Seat X".- Keep it local only. No backend. No multiplayer.- Use the reusable VRButton or simple selectable 3D marker.- Add comments explaining how this will later connect to multiplayer seat occupancy.

VSCode / Codex Prompt 9 — Seat camera view

Add a desktop camera focus mode for selected seats.Requirements:- When selectedSeatId changes, move the desktop camera target to view the table from that seat.- Keep OrbitControls working in desktop mode.- Do not break WebXR mode.- Add a simple "Return to overview" button for desktop testing.- Explain in comments that VR camera movement will be handled separately through XR origin/player rig behaviour.

Acceptance test

This phase is complete when:

you can click Seat 1–9

selected seat is stored

selected seat changes visually

desktop camera can focus from the seat view

no backend is required

Rough time

2–5 days.

Freelancer option

Micro-job title:

Local 9-seat selection system for React Three Fiber WebXR table

Budget: $50–$180

9. Phase 6 — Player Nameplates and Table States

Goal

Create readable player information around the table.

This is where the table starts feeling like a game instead of a model viewer.

Required nameplate info

Each player area should support:

player name

chip count

avatar placeholder

seated/empty state

active turn highlight

dealer badge

small blind badge

big blind badge

folded state

standing state

all-in state

bust state

Why this matters

21 Hold’em has more important states than normal blackjack. A player can be standing but still in betting. A player can be all-in but still making card decisions. A player can be bust but still have chips in pot structure.

The nameplate should help explain the state without needing a paragraph every time.

VSCode / Codex Prompt 10 — Player data and nameplates

Create a player presentation system for the 21 Hold’em WebXR table.Requirements:- Create PlayerState types in src/game/types/playerTypes.ts.- Include these states: - active - folded - standing - allIn - bust- Create mockPlayers.ts with 9 mock seats.- Create PlayerNameplate.tsx that displays: - player name - chip count - avatar placeholder - state label - badges for Dealer, SB, BB - active turn glow- Render nameplates at each seat anchor.- Keep everything data-driven.- Add comments explaining how real backend player data will replace mockPlayers later.

VSCode / Codex Prompt 11 — State visual language

Improve the PlayerNameplate visual states.Requirements:- Empty seats should look available.- Active player should be clearly highlighted.- Folded players should look dimmed.- Standing players should show "STAND".- All-in players should show "ALL-IN" and chip count 0.- Bust players should show "BUST".- Dealer, SB, and BB badges should be readable from table view.- Keep the design clean and VR-readable.Do not use tiny text.Do not use complex animations yet.

Acceptance test

This phase is complete when:

all 9 seats can show names and chip counts

player states are visually different

dealer/SB/BB badges are visible

mock data can change the table display

Rough time

2–5 days.

Freelancer option

Micro-job title:

VR-readable poker player nameplate system in React Three Fiber

Budget: $50–$180

10. Phase 7 — Card System

Goal

Create reusable card components that can show hole cards, community cards, face-down cards, and animated reveals.

Important rule

Do not make each card a custom object by hand.

Create one card component that takes props:

<Card value="A" suit="spades" faceUp={true} />

The card system should be reusable for 21 Hold’em, Deck Realms, PokerOpoly, and other Big Slick Games card projects later.

Tasks

Create card type definitions.

Create card visual component.

Support face up / face down.

Support value and suit display.

Support flip animation.

Support community card slots.

Support player hand slots.

Support card deal animation from dealer/deck to target slot.

VSCode / Codex Prompt 12 — Card component

Create a reusable 3D playing card component for the 21 Hold’em WebXR table.Requirements:- File: src/components/cards/Card3D.tsx- Props: - value: 'A' | '2' | '3' | ... | 'K' - suit: 'hearts' | 'diamonds' | 'clubs' | 'spades' - faceUp: boolean - position - rotation - scale optional- Display a simple readable card face when faceUp is true.- Display a card back when faceUp is false.- Use simple geometry/materials first.- Keep it performant and VR-readable.- Add comments showing where custom card textures can be added later.

VSCode / Codex Prompt 13 — Card flip animation

Add a flip animation to Card3D.Requirements:- The card should rotate smoothly when faceUp changes.- During the flip, the visible face/back should swap at the correct point.- Keep animation simple and reliable.- Do not add heavy animation libraries unless needed.- Add a test component with a button that flips one card back and forth.

VSCode / Codex Prompt 14 — Community cards

Create a CommunityCards component.Requirements:- Use the 5 community card anchors from tableLayout.ts.- Render up to 5 cards.- Empty slots should be visible in debug mode.- Cards can be face down or face up.- Add a test control that reveals cards one at a time.- Use Card3D.- Keep the data format simple and ready for backend state later.

VSCode / Codex Prompt 15 — Deal animation

Create a simple card deal animation system.Requirements:- Cards start from a deck/dealer position.- Cards animate to a target anchor position.- Support dealing to community slots and player hand slots.- Animation should be smooth and readable, not too fast.- Add a test button: "Deal Community Card".- Add comments explaining how this will later be triggered by game events.

Acceptance test

This phase is complete when:

cards render clearly

cards can be face up or face down

one card can flip

community cards can reveal one by one

cards can animate from dealer/deck to table slots

Rough time

4–10 days.

Freelancer option

Micro-job title:

Reusable 3D playing card component with flip and deal animation for React Three Fiber

Budget: $100–$350

This is one of the most important pieces. Pay for quality if needed.

11. Phase 8 — Chip, Bet Zone, and Pot System

Goal

Create visual chip stacks, player betting zones, centre pot movement, and payout animation.

This is where the table starts feeling alive.

Important distinction

The visual chip system does not need to calculate real pots at first.

It only needs to display chip amounts given by mock state.

The backend or mock game state decides the numbers. The chip component visualises them.

Tasks

Create chip component.

Create chip stack component.

Convert chip amount into a visible stack.

Render 9 betting zones.

Render amount labels.

Animate chips from bet zones to centre pot.

Animate pot payout to winner.

Support uncalled excess refund visually later.

VSCode / Codex Prompt 16 — Chip stack component

Create a reusable 3D chip stack component.Requirements:- File: src/components/chips/ChipStack.tsx- Props: - amount: number - position - maxVisibleChips optional - labelVisible optional- Use the existing chip model if available, otherwise use simple cylinder geometry.- Display a readable amount label above the stack.- Keep the number of visible chips capped for performance.- Add comments explaining how chip values are visual only and game amounts come from state.

VSCode / Codex Prompt 17 — Betting zones

Create a BettingZones component.Requirements:- Use 9 bet zone anchors from tableLayout.ts.- Render a ChipStack at each zone based on mock player contribution data.- Show a floating amount label for each bet zone.- Highlight the active player's betting zone.- Add debug labels for BetZone 1-9.- Keep it data-driven.

VSCode / Codex Prompt 18 — Pot display

Create a centre pot display.Requirements:- Render a ChipStack at the centre pot anchor.- Show total pot amount above it.- Use mock state for pot amount.- Add a simple animation when pot amount changes.- Keep it VR-readable.

VSCode / Codex Prompt 19 — Move chips to pot

Create a chip movement animation from player bet zones to the centre pot.Requirements:- Add a test button called "Collect Bets".- When pressed, visible chip stacks or chip markers animate from each active bet zone to the centre pot.- After animation, bet zone amounts become 0 and pot amount increases.- Keep the logic based on mock state.- Keep the animation simple and reliable.- Add comments explaining where real backend events will trigger this later.

VSCode / Codex Prompt 20 — Winner payout animation

Create a winner payout animation.Requirements:- Add a test button called "Pay Winner".- Move chips visually from the centre pot to a selected winner's seat or betting zone.- Update mock chip counts after the animation.- Show a short winner label such as "Seat 3 wins 1200".- Keep it simple and data-driven.

Acceptance test

This phase is complete when:

each player can show a bet amount

centre pot can show total amount

chips can visually move into the pot

chips can visually move to a winner

chip visuals are driven by state, not hardcoded one-off objects

Rough time

4–10 days.

Freelancer option

Micro-job title:

React Three Fiber chip stack, betting zone, pot collection and payout animation system

Budget: $150–$450

12. Phase 9 — Action Buttons and Legal Action Display

Goal

Create the action panel that shows the correct player choices based on game state.

This must follow the official rules document.

The action panel should not guess rules by itself. It should receive legal actions from mock state now, and backend state later.

Required buttons

Confirm

Stand

Fold

Check

Call <amount>

Raise

Double Down

Split

All-In

Cancel

Why this phase matters

In 21 Hold’em, button wording is part of player trust.

If the player is all-in, do not show Call.

If the player confirmed earlier but another player later raises, show Call/Fold/Raise if legal.

If the player is making a card decision, show Confirm/Stand.

If the UI gets this wrong, players will think the game is cheating even when the backend math is correct.

VSCode / Codex Prompt 21 — Legal action types

Create legal action types for 21 Hold’em.Requirements:- File: src/game/types/actionTypes.ts- Define legal actions: - CONFIRM - STAND - FOLD - CHECK - CALL - RAISE - DOUBLE_DOWN - SPLIT - ALL_IN - CANCEL- Include optional fields: - amount - disabledReason - requiresConfirmation- Create mock legal action sets for common scenarios: - normal card decision: Confirm / Stand - facing bet: Call amount / Fold / Raise / All-In - all-in card decision: Confirm / Stand only - no bet: Check / Raise / Confirm / Stand- Add comments linking this to the official rules source of truth.

VSCode / Codex Prompt 22 — Action panel

Create a VR-readable ActionPanel component.Requirements:- File: src/components/betting/ActionPanel.tsx- Accept an array of legal actions.- Render each legal action as a VRButton.- Button labels must follow rules: - CALL with amount displays "Call <amount>" - ALL_IN with amount displays "All-In <amount>" - CONFIRM displays "Confirm" - STAND displays "Stand"- Disabled actions should show disabled visual state and optional reason.- The panel should be positioned near the active player view.- Work in desktop and VR.

VSCode / Codex Prompt 23 — Raise selector

Create a RaiseSelector component for 21 Hold’em.Requirements:- Buttons: Min, Half Pot, Pot, All-In, Confirm, Cancel.- Show selected raise amount clearly.- Accept props for minRaise, potAmount, playerChips, and onConfirm.- Do not allow invalid amounts.- Keep all calculations simple and commented.- This is visual/frontend only. Backend will validate later.

VSCode / Codex Prompt 24 — Action panel state scenarios

Create a debug panel that lets me switch between mock action scenarios.Scenarios:1. Normal card decision: Confirm / Stand2. Facing a bet: Call 200 / Fold / Raise / All-In3. All-in card decision: Confirm / Stand only4. Checked then later raised: Call 300 / Fold / Raise5. No bet: Check / Raise / Confirm / Stand6. Bust or folded: no actionsWhen I choose a scenario, update the ActionPanel.This is for testing button wording and rule clarity.

Acceptance test

This phase is complete when:

action buttons render clearly

Call shows amount

all-in player never sees Call

card decision shows Confirm/Stand

raise selector works as a frontend mock

scenario switcher proves common states

Rough time

3–8 days.

Freelancer option

Micro-job title:

VR-readable 21 Hold’em action panel and raise selector in React Three Fiber

Budget: $100–$350

13. Phase 10 — Mock 21 Hold’em Game State

Goal

Create a local fake game state that can drive the entire table.

This is not the real backend. It is a controlled stage play.

The purpose is to let the VR table demonstrate the game without waiting for full multiplayer integration.

Why this matters

A visual prototype needs a clean demo flow.

If you connect to the real backend too early, you will spend all your time debugging networking and edge cases instead of proving the table experience.

The mock state should imitate backend shape, so it can be replaced later.

Mock flow example

The first scripted hand could be:

3 players seated.

Blinds posted.

Hole cards dealt.

Community card appears.

Player action panel shows Confirm / Stand / Raise / Fold depending on state.

One player raises.

Another player calls.

One player goes all-in short.

Community cards continue.

Showdown creates main pot and side pot.

Chips move to winners.

This scripted flow should demonstrate the special 21 Hold’em rules, especially all-in and side pots.

VSCode / Codex Prompt 25 — Mock game state store

Create a Zustand mock game store for the 21 Hold’em WebXR prototype.Requirements:- File: src/game/state/useMockGameStore.ts- Include: - players - currentTurnSeatId - communityCards - potAmount - sidePots - playerContributions - legalActionsForCurrentPlayer - handPhase- Add actions: - dealHoleCards - revealCommunityCard - setCurrentTurn - applyMockAction - collectBetsToPot - payWinner - resetHand- Keep this as a visual demo state, not real backend rules.- Add comments showing where real backend state will replace this later.

VSCode / Codex Prompt 26 — Scripted demo sequence

Create a scripted demo sequence for the 21 Hold’em VR table.Requirements:- Add a DemoControls component with buttons: - Reset - Step Forward - Auto Play - Pause- Each step should update mock game state.- Steps should include: 1. Players seated 2. Blinds posted 3. Hole cards dealt 4. First community card revealed 5. Player 1 confirms 6. Player 2 raises 7. Player 3 goes all-in short 8. Bets collected 9. More community cards revealed 10. Showdown 11. Main pot and side pot winners shown- Trigger card/chip animations where available.- Keep everything easy to edit.

VSCode / Codex Prompt 27 — Rule explanation overlay

Create a simple table explanation overlay for the scripted demo.Requirements:- Show a short text prompt for each demo step.- Explain what is happening in plain English.- Include important 21 Hold’em concepts: - 21 does not always end the hand - all-in players can still win eligible pots - side pots are separate - Confirm means card intent - Standing stops cards, not necessarily betting obligations- Make the overlay readable in desktop mode and VR mode.- Keep text short per step.

Acceptance test

This phase is complete when:

one button can step through a fake hand

table visuals update from mock state

cards deal/reveal

chips move

action buttons change

showdown displays winners

the demo teaches the unique rules

Rough time

5–12 days.

Freelancer option

Micro-job title:

Scripted 21 Hold’em WebXR demo flow using mock game state

Budget: $200–$600

This is a good candidate for a stronger freelancer because it ties many pieces together.

14. Phase 11 — First Vertical Slice

Goal

Create a complete local experience that feels like a real product demo.

This is the first “show people” version.

It should include

3D table

3 seated players minimum

cards

chips

pot movement

action panel

scripted flow

explanation overlay

WebXR mode

desktop fallback

simple lobby or start screen

It should not include yet

real multiplayer

real account login

real wallet

full lobby matchmaking

voice chat

hand tracking

avatars with bodies

app store deployment

Those are later.

VSCode / Codex Prompt 28 — Vertical slice polish pass

Review the current 21 Hold’em WebXR prototype and turn it into a clean vertical slice demo.Requirements:- Add a simple start screen with buttons: - Start Demo - Enter VR - How To Play- Ensure the table scene loads cleanly.- Ensure the scripted demo can reset and replay.- Make button text and table prompts consistent.- Remove unused test clutter from the main view.- Keep debug tools accessible behind a "Dev Tools" toggle.- Do not add multiplayer.- Do not add backend calls.

VSCode / Codex Prompt 29 — Demo cleanup checklist

Create a developer cleanup checklist for this project.Include checks for:- broken imports- console errors- unused components- debug markers hidden by default- Quest Browser performance- desktop fallback- readable VR text- action button labels- reset demo flow- missing model fallbacksPut this checklist in docs/demo-cleanup-checklist.md.

Acceptance test

This phase is complete when:

you can send someone a URL

they can understand the demo without you explaining everything

the Quest version opens

the desktop version works

the demo resets cleanly

Rough time

1–2 weeks after core components exist.

15. Phase 12 — Backend Mapping Plan

Goal

Prepare the WebXR client to connect to the existing 21 Hold’em backend without ripping apart the prototype.

This phase should start after the mock vertical slice works.

Important principle

Do not connect the backend directly into random components.

Create an adapter layer.

The frontend should have one clean internal table state shape. Backend events should be transformed into that shape.

Backend state adapter concept

Backend socket event/data ↓backendToTableStateAdapter.ts ↓Internal VR table state ↓React components render the table

This avoids turning every component into a backend-specific mess.

VSCode / Codex Prompt 30 — Backend adapter types

Create a backend adapter plan for connecting the WebXR table to the existing 21 Hold’em backend.Requirements:- Create src/game/types/backendTypes.ts with placeholder backend event/data types.- Create src/game/types/tableStateTypes.ts with the internal frontend table state type.- Create src/game/state/backendToTableStateAdapter.ts.- The adapter should convert backend-style data into internal table state.- Use mock backend data for now.- Add comments explaining that real socket events will be connected later.Do not connect real sockets yet.

VSCode / Codex Prompt 31 — Legal actions from backend

Update the action panel system so it can receive legal actions from table state instead of hardcoded mock scenarios.Requirements:- The internal table state should include legalActionsForMe.- ActionPanel should render from legalActionsForMe.- Keep mock scenarios working through the adapter.- Add examples for: - all-in card decision - facing call - confirm/stand - raise-after-confirm

Backend fields the VR table will eventually need

The VR/WebXR frontend needs backend state like:

board/table ID

seat list

player list

player chip counts

current turn player

legal actions for current user

current bet / toCall

player contributions

pot amount

side pot structure

community cards

private cards for current player

visible showdown cards

player states: active, folded, standing, all-in, bust

dealer/SB/BB positions

hand phase

countdown timer

winner results

refund events

Acceptance test

This phase is complete when:

mock backend data can drive the same table components

action panel gets legal actions from state

no component needs to know whether data came from mock or backend

Rough time

3–7 days.

16. Phase 13 — Real Backend Connection

Goal

Connect the WebXR table to the real 21 Hold’em game state.

This should happen only after the vertical slice works locally.

Tasks

Identify existing socket events.

Create a socket client module.

Authenticate if needed.

Join a table by ID/private code.

Receive table state updates.

Convert backend state through adapter.

Send player actions from ActionPanel.

Confirm backend validation rejects illegal actions.

Display backend results.

VSCode / Codex Prompt 32 — Socket module shell

Create a socket client module for the WebXR 21 Hold’em frontend.Requirements:- File: src/game/network/socketClient.ts- Use socket.io-client if the existing backend uses Socket.io.- Include functions: - connectToGameServer - joinTable - leaveTable - sendPlayerAction - subscribeToTableState - disconnect- Keep the module isolated from React components.- Use placeholder event names for now and mark them clearly with TODO comments.- Do not hardcode secrets.

VSCode / Codex Prompt 33 — Connect real actions safely

Wire ActionPanel button clicks to send actions through the socket client.Requirements:- Keep mock mode available.- Add a config flag or environment variable for MOCK_MODE.- In mock mode, actions update local state.- In backend mode, actions send socket events.- Do not let components call socket.io directly.- Use a clean action dispatcher function.- Add console logs in dev mode only.

VSCode / Codex Prompt 34 — Private table join screen

Create a simple private table join screen for the WebXR prototype.Requirements:- Input for private table code.- Button: Join Table.- Button: Demo Mode.- On Join Table, call the socket joinTable function.- On Demo Mode, load the scripted mock demo.- Keep UI simple and desktop-friendly first.- Later this can become a VR keypad.

Acceptance test

This phase is complete when:

app can join a backend table

table state appears in the 3D scene

legal actions come from backend

button clicks send actions to backend

mock mode still works

Rough time

1–3 weeks depending on backend readiness.

Freelancer option

Micro-job title:

Connect React Three Fiber 21 Hold’em table to Socket.io backend through adapter layer

Budget: $300–$1,200

This is not a $20 job. Backend integration is where cheap work can get dangerous.

17. Phase 14 — Multiplayer VR Table Prototype

Goal

Make multiple real players appear seated at the same table and interact with the same hand.

This is the first true multiplayer version.

What should sync

seated players

names and chip counts

dealer/SB/BB badges

cards visible to each player

community cards

player actions

chip contributions

pot movement

player states

showdown results

What should not be added yet

voice chat

full avatar bodies

hand tracking

fancy social lobby

complex emotes

Those are distractions until the table works.

VSCode / Codex Prompt 35 — Multiplayer state display audit

Audit the current WebXR table components for multiplayer readiness.Create docs/multiplayer-readiness.md explaining:- which components are already data-driven- which components still use local-only state- which components need backend table state- how player-specific private cards should be handled- how spectator/other player card visibility should work- where legal actions should come fromDo not change code yet. Create the audit document first.

VSCode / Codex Prompt 36 — Player-specific card visibility

Update the card rendering system to support player-specific visibility.Requirements:- Current user's private cards can be face up to them.- Other players' private cards should be face down unless showdown reveals them.- Community cards follow table state.- Use a currentUserId/currentSeatId value from state.- Keep mock examples for testing.

Acceptance test

This phase is complete when:

two browser sessions can join same table

player state updates across sessions

one player’s action changes the table for all

private cards are not incorrectly exposed

Quest Browser still works

Rough time

2–6 weeks depending on backend condition.

18. Phase 15 — Quest Optimisation

Goal

Make the WebXR version comfortable and performant enough on Quest Browser.

Optimisation priorities

Reduce model complexity.

Use compressed textures.

Avoid heavy shadows.

Avoid expensive post-processing.

Limit real-time lights.

Keep text large.

Avoid tiny UI buttons.

Keep animations short and readable.

Load assets progressively if needed.

Test on Quest early and often.

VSCode / Codex Prompt 37 — Performance audit

Perform a performance audit of the WebXR 21 Hold’em prototype.Create docs/performance-audit.md with:- current model list- estimated heavy components- texture sizes- use of shadows/lights- animation costs- possible Quest Browser bottlenecks- recommended fixes in priority orderThen add optional dev-only performance stats to the app.Do not make major visual changes yet.

VSCode / Codex Prompt 38 — Low-end mode

Add a low-end performance mode for Quest Browser.Requirements:- Disable expensive shadows.- Reduce decorative objects.- Reduce animation intensity if needed.- Use simpler materials.- Add a setting toggle: Performance Mode.- Default Performance Mode to true on mobile/Quest-like user agents where reasonable.- Keep desktop visuals unchanged when Performance Mode is off.

Acceptance test

This phase is complete when:

Quest Browser can run the demo smoothly enough to test

text is readable in headset

buttons are comfortable to select

scene does not feel heavy or jittery

Rough time

1–3 weeks, ongoing.

19. Phase 16 — Lobby and Product Wrapper

Goal

Create a simple Big Slick Games VR entry point.

This should come after the table vertical slice. Do not build a huge lobby first.

First lobby features

title: 21 Hold’em VR

Start Demo

Join Private Table

How To Play

Settings

Enter VR

simple background/table preview

Later lobby features

avatar selection

wallet/chip balance

daily rewards

table browser

friends

portals to other games

social area

VSCode / Codex Prompt 39 — Simple lobby

Create a simple lobby/start screen for the 21 Hold’em WebXR prototype.Requirements:- Buttons: - Start Demo - Join Private Table - How To Play - Settings - Enter VR- Use Big Slick Games / 21 Hold’em branding placeholders.- Keep it clean, fast, and not overdesigned.- Start Demo loads the local scripted table demo.- Join Private Table opens the private code screen.- How To Play opens a simple rule summary.

Acceptance test

This phase is complete when:

the app feels like a product, not a dev test

users can choose demo or join flow

the table scene is not the only page

Rough time

3–10 days.

20. Freelancers — Full Micro-Job List

These jobs should be posted separately. Do not give freelancers the whole project unless they are trusted.

Setup jobs

Job 1 — WebXR starter scene

Output: React/Vite/Three/WebXR app with Enter VR button.Budget: $50–$150

Job 2 — Quest Browser test page

Output: Simple deployed WebXR page confirmed on Quest Browser.Budget: $50–$150

Table jobs

Job 3 — Data-driven table anchor system

Output: 9 seats, 9 bet zones, 5 community slots, centre pot anchor.Budget: $50–$150

Job 4 — Seat selection system

Output: local seat select, occupied visual state, selected seat state.Budget: $50–$180

Job 5 — Player nameplates

Output: name, chips, avatar placeholder, state, badges.Budget: $50–$180

VR interaction jobs

Job 6 — Reusable VR button

Output: desktop + Quest controller selectable 3D button.Budget: $75–$250

Job 7 — VR action panel

Output: Fold, Check, Call, Raise, Confirm, Stand, etc.Budget: $100–$350

Job 8 — Raise selector

Output: Min, Half Pot, Pot, All-In, Confirm, Cancel.Budget: $75–$250

Card jobs

Job 9 — 3D card component

Output: reusable card with value/suit/faceUp props.Budget: $75–$200

Job 10 — Card flip animation

Output: smooth face-up/face-down flip.Budget: $50–$150

Job 11 — Deal animation

Output: card moves from deck/dealer to target slot.Budget: $75–$250

Job 12 — Community card reveal system

Output: 5 slots, reveal one by one.Budget: $75–$200

Chip jobs

Job 13 — Chip stack component

Output: amount-based visible stack with label.Budget: $75–$200

Job 14 — Betting zone component

Output: 9 zones with contribution stacks.Budget: $75–$200

Job 15 — Pot collect animation

Output: chips move from bet zones to pot.Budget: $100–$300

Job 16 — Winner payout animation

Output: pot moves to winner, amount label shown.Budget: $100–$300

Mock game jobs

Job 17 — Mock game state store

Output: Zustand store driving players, cards, pots, actions.Budget: $150–$400

Job 18 — Scripted demo sequence

Output: step-through demo of a 21 Hold’em hand.Budget: $200–$600

Job 19 — Rule explanation overlay

Output: short prompts explaining key rules during demo.Budget: $75–$250

Backend jobs

Job 20 — Backend adapter layer

Output: backend data converted to internal table state.Budget: $200–$600

Job 21 — Socket connection module

Output: isolated socket client for table join/actions/state.Budget: $250–$800

Job 22 — Private table join screen

Output: code input, join flow, demo mode.Budget: $100–$300

Job 23 — Real backend action wiring

Output: ActionPanel sends real backend events.Budget: $300–$1,000

Optimisation jobs

Job 24 — Quest performance audit

Output: report and basic performance fixes.Budget: $150–$500

Job 25 — Low-end performance mode

Output: toggle that reduces heavy visuals for Quest.Budget: $150–$500

Integration jobs

Job 26 — Vertical slice integration

Output: combine table, cards, chips, buttons, mock state into clean demo.Budget: $400–$1,500

Job 27 — Multiplayer prototype integration

Output: two users joined to same live table state.Budget: $800–$3,000+

21. Budget Plan

Dirt-cheap proof plan

Do only enough to test whether WebXR 21 Hold’em feels good.

Includes:

WebXR starter

table anchors

VR buttons

card component

chip component

action panel

mock demo

Estimated spend:

$500–$1,500

This assumes Brent models all assets and Codex does some code work.

Strong vertical slice plan

Includes:

all proof plan items

card animations

chip movement

scripted demo

rule overlay

lobby screen

Quest optimisation pass

Estimated spend:

$1,500–$5,000

This is the recommended serious prototype range.

Backend-connected prototype

Includes:

vertical slice

backend adapter

socket connection

private table join

real action wiring

Estimated spend:

$4,000–$10,000

This depends heavily on how clean the existing backend is.

Multiplayer VR table prototype

Includes:

real backend state

multiple players

private card visibility

live actions

Quest testing

integration fixes

Estimated spend:

$8,000–$20,000+

This is not where to start.

22. Suggested Timeline

Week 1 — WebXR foundation

Brent:

create project

run local web app

deploy test page

open on Quest Browser

Codex/freelancer:

WebXR starter scene

Enter VR button

basic table placeholder

Deliverable:

A blank WebXR table scene that opens on Quest.

Week 2 — Table assets and layout

Brent:

model table v01

model card v01

model chip v01

create seat/bet/pot markers

export GLB files

Codex/freelancer:

import models

create anchor layout

render debug markers

Deliverable:

A 3D 21 Hold’em table layout in browser.

Week 3 — VR buttons and seating

Brent:

test table scale in headset

adjust models

define preferred player view

Codex/freelancer:

VR button component

seat selection

player nameplates

Deliverable:

User can select a seat and interact with basic VR buttons.

Week 4 — Cards

Brent:

improve card model/textures if needed

create card back style

Codex/freelancer:

card component

card flip

community slots

deal animation

Deliverable:

Cards deal and reveal on the 3D table.

Week 5 — Chips and pot

Brent:

improve chip model

create visual chip colours

adjust pot/bet zone look

Codex/freelancer:

chip stack

betting zones

collect-to-pot animation

payout animation

Deliverable:

Bets appear, chips move to pot, winner gets paid visually.

Week 6 — Action panel

Brent:

review button wording against official rules

decide final layout of action panel

Codex/freelancer:

legal action types

action panel

raise selector

scenario switcher

Deliverable:

Correct action buttons appear for common 21 Hold’em states.

Week 7 — Mock game flow

Brent:

choose the first demo hand

write plain-English explanation prompts

Codex/freelancer:

Zustand mock game store

step-through scripted demo

rule overlay

Deliverable:

A fake but convincing playable hand demo.

Week 8 — Vertical slice polish

Brent:

improve models and branding

test in Quest

record feedback

Codex/freelancer:

start screen

cleanup

debug tools toggle

performance mode

Deliverable:

A shareable WebXR vertical slice demo.

Weeks 9–10 — Backend mapping

Brent/main dev:

compare existing backend state to VR table needs

list missing fields/events

Codex/freelancer:

backend adapter

socket client shell

private table join screen

Deliverable:

The VR table can receive backend-shaped state without changing visual components.

Weeks 11–14 — Real backend connection

Brent/main dev/freelancer:

connect real table state

send real actions

test private tables

fix missing backend events

Deliverable:

A real backend-connected 21 Hold’em WebXR table prototype.

Weeks 15+ — Multiplayer, polish, lobby, expansion

Only after the table works:

real multiplayer testing

Quest optimisation

lobby

wallet/profile connection

daily rewards

avatars

audio

tutorial mode

23. Brent’s Personal Task List in Order

This is the practical “what do I do next?” list.

Step 1 — Create Operation VR folder

Create a clean project folder. Do not mix it with existing 21 Hold’em frontend yet.

operation-vr

Step 2 — Start the Vite/React/WebXR app

Use Codex Prompt 1 and Prompt 2.

Do not model anything huge until this works.

Step 3 — Confirm Quest can open the test scene

Deploy the simple scene to HTTPS and open it on Quest Browser.

If this fails, fix this before continuing.

Step 4 — Model table v01

Create a simple table with:

9 player positions

dealer zone

centre pot zone

5 community card slots

9 bet zones

Do not over-polish.

Step 5 — Export table as GLB

Save as:

public/models/vr_table_v01.glb

Step 6 — Import table into VSCode app

Use Codex Prompt 3.

Step 7 — Add table anchors

Use Codex Prompt 4.

Adjust positions until the scene makes sense.

Step 8 — Model card v01 and chip v01

Keep both simple and clean.

Export as:

public/models/vr_card_v01.glbpublic/models/vr_chip_v01.glb

Step 9 — Add VR button test

Use Prompt 6 and Prompt 7.

Confirm controller ray interaction works.

Step 10 — Add seat selection

Use Prompt 8 and Prompt 9.

Step 11 — Add nameplates

Use Prompt 10 and Prompt 11.

Step 12 — Add cards

Use Prompts 12–15.

Do not get lost making perfect card art yet.

Step 13 — Add chips and pot

Use Prompts 16–20.

Step 14 — Add action panel

Use Prompts 21–24.

Check all wording against official 21 Hold’em rules.

Step 15 — Build scripted demo hand

Use Prompts 25–27.

Choose a hand that shows why 21 Hold’em is unique.

Step 16 — Polish vertical slice

Use Prompts 28–29.

Make it clean enough to show.

Step 17 — Only then touch backend

Use Prompts 30–34.

Do not connect backend before the local table feels good.

24. The First Demo Hand to Build

The first scripted demo should show something normal players instantly understand, while also showing the unique side-pot logic.

Suggested demo

Three players:

Brent: 1000 chipsMili: 600 chipsRam: 1000 chips

Flow:

Blinds/boot posted.

Everyone gets a private card.

First community card appears.

Brent confirms.

Mili raises.

Ram calls.

Brent re-enters action because Confirm did not protect him from the raise.

Brent calls.

Another community card appears.

Mili goes all-in short.

Brent and Ram continue for a side pot.

Someone reaches 21.

The hand does not instantly end because side pot remains.

Showdown resolves main pot and side pot separately.

This demo teaches:

Confirm is not immunity from future raises

All-in players remain eligible for matched pots

Side pots matter

21 does not automatically end everything

That is the soul of 21 Hold’em.

25. Freelancer Posting Template

Use this template for each micro-job.

Title:[Specific small job name]Goal:Create one small, isolated component/demo for a WebXR 21 Hold’em table prototype.Tech stack:- Vite- React- TypeScript- Three.js- React Three Fiber- @react-three/xr- @react-three/dreiImportant:This is not a full game.No backend required unless stated.No multiplayer required unless stated.No login required.Keep it simple, clean, and easy to merge.Deliverables:1. Working source files2. Clear file names3. Short written instructions4. Short video or screenshots showing it working5. Beginner-friendly comments in the codeAcceptance test:I should be able to run the app and confirm:- [specific test 1]- [specific test 2]- [specific test 3]Style:Modern poker/blackjack table feel.Fake-money game only.No real-money gambling branding.Performance-friendly for Quest Browser.Ownership:All delivered work must be original or use clearly licensed assets/code.

26. Anti-Disaster Rules

Do not build the lobby first

The table is the product. The lobby is packaging.

Do not add multiplayer first

Multiplayer makes every bug harder. Prove the table locally first.

Do not over-model before testing Quest

A beautiful model that runs badly in Quest Browser is not useful.

Do not give freelancers the whole vision

Give them tiny outputs and acceptance tests.

Do not let frontend guess rules

The official rules document is law. The backend provides legal actions.

Do not connect real backend too early

Mock state first. Backend later.

Do not chase hand tracking early

Controller rays are enough for v1.

Do not make every chip physically grabbable early

Visual chip movement is enough. Physical grabbing can come later.

Do not polish before proving flow

A rough playable table beats a beautiful static room.

27. Definition of Done for Version 1

Version 1 is done when:

the app opens in desktop browser

the app opens in Quest Browser

the user can enter VR

the table is visible and comfortable

the player can select a seat

cards can deal and reveal

chips can move to pot

action buttons can be pressed

a scripted 21 Hold’em hand can play start to finish

showdown explains winners and pots

the demo can reset

no real backend is required

That is the first win.

Not perfect. Not finished. But real.

28. Definition of Done for Version 2

Version 2 is done when:

the app can join a real 21 Hold’em table

backend state drives the 3D table

legal actions come from backend

player actions send to backend

private cards are only shown to the correct player

table state updates after each action

pot results display correctly

desktop and Quest Browser both work

29. Definition of Done for Version 3

Version 3 is done when:

multiple real players can sit at the same table

turns update live

chips/cards/pots stay synced

reconnect behaviour is acceptable

private table codes work

performance is acceptable on Quest

the experience is good enough for controlled testers

30. Final Recommendation

Build Operation VR in this order:

WebXR app shell

Quest test

Brent’s table model

Static table layout

VR buttons

Seat selection

Nameplates

Cards

Chips

Action panel

Mock game flow

Vertical slice

Backend adapter

Real backend connection

Multiplayer

Lobby and polish

This keeps the project moving forward without betting the farm on one giant system.

The first big win is not multiplayer.

The first big win is seeing 21 Hold’em sitting on a 3D table in Quest Browser, with cards dealing, chips moving, and buttons working.

Once that exists, the rest becomes a matter of wiring, testing, and polish.

That is how Operation VR becomes real.
