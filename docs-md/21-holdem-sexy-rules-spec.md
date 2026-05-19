# 21 Holdem Sexy Rules Spec

21 Hold’em — Official Game Rules & Product Law

Last updated: 17 May 2026Status: Source of truth for gameplay, backend validation, frontend buttons, VR/WebXR interfaces, bot logic, tutorials, help copy, QA testing, and developer onboarding.

Why This Document Exists

21 Hold’em is simple to explain at the table, but it becomes easy to break in code if the rules are treated like normal blackjack.

That is the main danger.

This game is not dealer blackjack with poker decorations. It is a player-versus-player betting game where blackjack-style totals decide individual pots, and poker-style eligibility decides who can win each pot. That means a player can have the best hand on the table and still be unable to win every chip in the middle. It also means a player hitting 21 does not automatically end the hand, because other pots may still be live.

This document exists so every part of the product speaks the same language:

the backend knows what actions are legal

the frontend knows which buttons to show

the VR/WebXR table knows what to visualise

bots follow the same rules as humans

tutorials teach the real game instead of a simplified lie

QA can test known edge cases instead of guessing what should happen

The purpose is not just to describe the rules. The purpose is to stop accidental rule drift as the game grows.

The One-Line Pitch

21 Hold’em is blackjack with poker pressure.

Players chase the best total of 21 or less, but betting, raises, folds, all-ins, side pots, and community cards decide who is actually eligible to win the chips.

The player-facing version should feel fast and obvious:

Get close to 21. Don’t bust. Bet against other players. Win the pots you are eligible for.

The developer-facing version is stricter:

Hand strength only matters inside each pot’s eligibility group.

That second sentence is the heart of the whole game.

Product Commandments

These are the rules that must survive every refactor, UI redesign, bot shortcut, VR prototype, and backend optimisation.

1. 21 does not automatically end the hand.

In blackjack, 21 often feels like the final answer. In 21 Hold’em, it is only the best possible hand total. It does not automatically resolve every pot because one player may be eligible for only part of the total money in play.

For example, if Player A is all-in for 400 and reaches 21, but Player B and Player C have each contributed 900, Player A can only win the main pot up to the 400 contribution level. The side pot between Player B and Player C still needs to be resolved separately.

If the backend ends the full hand the moment someone reaches 21, it will incorrectly steal side-pot outcomes from other eligible players.

2. All-in is not fold, stand, or bust.

All-in only means the player has no chips left to add. It does not mean they have stopped taking cards, surrendered the hand, or lost the ability to win pots they already contributed to.

This matters because an all-in player may still need to decide whether to accept future community cards. They cannot call a later raise, but they may still be affected by later shared cards if they have not stood.

A bad implementation treats all-in like a locked final state. A correct implementation treats it as a chip-cap state.

3. Standing stops card intake, not betting obligations.

When a player stands, they are saying: “I do not want more community cards for this hand.” They are not saying: “I am immune from future raises.”

If another eligible player raises after the stand, the standing player may still need to call or fold if they have chips and are eligible for the pot being contested.

This is one of the rules most likely to confuse players if the UI wording is weak. The player needs to understand that standing protects their hand total, not their chip stack.

4. Confirm means card intent, not protection from later betting.

Confirm means the player accepts their current position and, where relevant, agrees to take the next community card. It does not permanently close the betting round for that player.

If a player confirms, and then another player raises, the confirming player must return to a real betting decision if they have chips and remain eligible.

This is important because otherwise a player could accidentally become protected from later raises simply because they acted earlier in the round. That would break the poker pressure of the game.

5. Side pots are built from contribution levels, not from one big pot number.

A single total pot display is fine for the player, but the backend must understand the pot as layers of matched contributions.

Players can only win pot layers they contributed to. This is how all-in situations remain fair.

If the backend only tracks one global pot and one winner, all-in and side-pot outcomes will eventually break.

6. Bust players cannot win by hand strength.

A bust hand is dead for scoring. The player’s chips remain in the pot, but their hand cannot win by total.

This does not mean the pot disappears. It means the bust player is removed from winning consideration for each pot they are eligible for.

If every eligible player in a pot is bust, the backend must use a configured fallback rule. It must not improvise.

7. No player should be asked to call with chips they do not have.

A player with fewer chips than the amount required to call can go all-in short if the rules allow, but they cannot be shown a normal full call they cannot pay.

This is both a rules issue and a trust issue. A button that says “Call 500” when the player has 300 chips is lying unless the action is clearly represented as an all-in short call.

8. Uncalled excess must be refunded.

If a player bets or raises more than any eligible opponent can contest, the unmatched extra amount must not remain trapped in the pot.

This is a core poker fairness rule. Chips only belong in a pot if another eligible player matched or could contest them.

Without this rule, a player could lose chips to nobody, which feels broken because it is broken.

9. UI buttons must say what the rule actually means.

The frontend should not hide ambiguous logic behind friendly wording.

If a player needs to add chips, the button should say Call <amount>. If the player is only confirming card intent, the button should say Confirm. If the player is all-in, the UI must not show a chip-funded call.

Good button language teaches the game. Bad button language makes the player think the game is cheating.

10. Backend logic wins over frontend assumptions.

The frontend, including a future VR or WebXR table, should not decide which actions are legal by guessing from local state. The backend should provide the legal action set.

The frontend’s job is to display the decision clearly and make the action feel good. The backend’s job is to enforce the law.

This keeps desktop, mobile, bots, and VR all aligned.

1. Core Objective

Each player is trying to make the highest valid hand total of 21 or less.

At showdown, each pot is awarded to the eligible player or players with the highest non-busting total inside that pot’s eligibility group.

This distinction matters. The game does not simply find the best hand at the table and push the whole pot to that player. It must resolve each pot separately, because different players may be eligible for different layers of chips.

A player who contributed less because they went all-in can still win the main pot. They cannot win side pots created by later betting above their contribution level.

That is where the game becomes poker-like. The hand total decides strength, but chip contribution decides reach.

Bust Rule

A bust hand cannot win a pot by hand strength.

If every eligible player in a pot is bust, no player has won that pot by normal scoring. In that situation, the backend must apply one explicit configured table rule.

The important part is consistency. The game cannot sometimes refund, sometimes award by closest bust, sometimes award to last aggressor, or sometimes let the pot vanish unless that behaviour is deliberately configured and documented.

2. Cards & Hand Totals

A player’s hand total is calculated from the private card or cards they hold, plus the community cards that apply to them.

Community cards do not automatically apply forever. A player who stands stops accepting future community cards for that hand. A player who confirms continues accepting future community cards when they are dealt. This creates a strategic difference between protecting a safe total and chasing a stronger one.

Aces may count as 11 or 1, using whichever value gives the best non-busting total.

For example:

A + 7 = 18A + 7 + 9 = 17A + K = 21A + K + 5 = 16

The ace adjustment should always produce the best valid total where possible. If no ace adjustment can prevent the total from exceeding 21, the hand is bust.

A bust player cannot win by score, but their committed chips remain part of the pot structure. This prevents a player from escaping chip commitments simply because their hand went over 21.

3. High-Level Hand Flow

A hand follows this overall flow:

Active seats are confirmed.

Blinds, boot amounts, or forced opening commitments are collected.

Private cards are dealt.

Players act in turn order.

Community cards are dealt as betting and decision rounds complete.

Players may confirm, stand, call, raise, fold, double down, split, or go all-in when those actions are legal.

The hand reaches showdown when no further legal progression exists.

Pots are built from contribution levels.

Each pot is awarded by eligibility and hand total.

This flow should feel natural to the player, but the backend must treat it as a state machine.

Every player action should answer two questions:

Does this action change the player’s chip contribution?Does this action change whether future community cards apply to the player?

Many bugs happen when those two ideas are blurred together.

For example, standing affects card intake. Calling affects chip contribution. Confirm may affect card intent. All-in affects chip capacity. These are separate concepts and should be represented separately in code.

4. Player States

Player states describe what the player can still do and what they can still win. They should not be treated as cosmetic labels.

Active

An active player is still contesting at least one pot and may receive legal turns.

Active does not always mean the player can perform every action. An active player may be unable to raise, may be facing a call, may have already stood, or may be all-in. The active state simply means they have not folded and have not been removed from the hand.

Folded

A folded player has surrendered all claim to the current hand.

Folding is final for that hand. The player cannot win any pot, even if their cards would later become the best total. Their chips already committed stay in the pot because those chips were risked before the fold.

Folded players should not receive further betting decisions or card decisions. Showing them more decisions after folding creates confusion and risks illegal state changes.

Standing

A standing player has chosen to stop accepting further community cards.

This is a card-control state, not a chip-protection state.

A standing player can still be part of betting if another eligible player raises after the stand. If the standing player has chips and remains eligible for the raised pot, they must be able to respond to that wager.

The frontend should make this clear. A player should not think “Stand” means “I am safe from future betting.” It means “I am keeping this total.”

All-In

All-in is a chip commitment state.

An all-in player has no chips left to add, but they remain in the hand for any pots they are eligible to win.

This distinction matters because all-in players can still have meaningful card decisions. If they have not stood, future community cards may improve or bust their hand. They cannot call or raise, but their hand is not dead.

An all-in player:

remains active in the hand

cannot add more chips

cannot call, raise, double down, or perform chip-funded actions

may still confirm or stand when future card decisions are legal

may only win pots up to their committed contribution level

must never be asked to call a later raise

The most important implementation warning is this:

allIn !== foldedallIn !== standingallIn !== bust

If those states collapse into one another in code, side pots and card decisions will break.

Bust

Bust means the player’s best possible total is over 21.

A bust player cannot win by hand strength. However, bust should not erase their earlier contributions. Their chips remain in the pot structure and may be won by other eligible players.

Bust is a scoring condition, not a refund condition.

5. Confirm, Stand & Community Cards

Confirm and Stand are easy to display as simple buttons, but they carry important meaning. The game needs to preserve the difference between card decisions and betting decisions.

Confirm

Confirm means the player accepts their current position and, where relevant, agrees to take the next community card.

Confirm is not the same as check, call, or stand. It may happen when no extra chips are required, or when the player is confirming a pending decision that includes card intent.

The dangerous bug is treating Confirm as if it permanently completes the player’s involvement in the round. It does not.

If a player confirms, and another player later raises, the confirming player must return to a betting decision if they:

still have chips

have not folded

remain eligible for the raised pot

are not all-in

This preserves fairness. A player should not be shielded from a later raise simply because they confirmed before the raise happened.

Stand

Stand means the player confirms their current position and stops accepting future community cards for that hand.

Standing protects the player’s hand total from future community cards. It does not protect the player from future betting.

For example, a player may stand on 19 because taking another community card is too risky. If another player then raises, the standing player may still have to call or fold to remain eligible for that pot level.

That is an intentional strategic tension.

All-In Confirm / Stand

All-in players may still need card-control decisions because community cards can still affect their hand total.

For an all-in player:

Confirm = accept the next community cardStand = stop accepting future community cards

Neither action changes chip contribution because the player has no chips left.

The backend should defer all-in Confirm/Stand decisions until live betting players have settled the current bet. This prevents an all-in player from being shown a card decision while other players are still raising or calling.

That sequencing matters. Otherwise the UI can show decisions in an order that makes the hand feel broken, even if the final math is technically correct.

6. Betting Fundamentals

Each betting round has a current required contribution. In the existing backend, this is represented as:

nMinBet

For each player:

toCall = current required contribution - player contribution this betting round

If toCall is 0, the player is not facing a bet.

If toCall is greater than 0, the player must respond to the wager. Their legal options depend on their chip count, state, and eligibility.

A normal player facing a bet may be able to:

call the required amount

fold

raise, if they can call and add a valid raise

go all-in short if they cannot cover the full call or choose to commit all remaining chips

The backend should calculate and return the legal actions. The frontend should not infer them from button state alone.

This is especially important for VR/WebXR, where the table may show beautiful buttons and chip animations but must not become the source of truth. The 3D table is theatre. The backend is law.

7. Raising

A raise increases the current required contribution for eligible live players.

Players may raise even when another player is already all-in, as long as at least one other non-folded live player with chips can contest the raise.

This rule exists because all-in players should not freeze the rest of the table. If Player A is all-in, but Player B and Player C still have chips, Player B and Player C can continue building a side pot between themselves.

A bad implementation says:

Someone is all-in, so no more raises.

A correct implementation says:

Can at least two eligible live players with chip capacity contest more chips?If yes, betting may continue for those players.

Overbet & Short-Stack Rule

If a player raises more than another player can cover, the short-stacked player may continue by going all-in for their remaining chips.

Example:

Player A raises 500.Player B has 400.Player B may go all-in for 400.

The unmatched extra amount must not be trapped in a pot no one can contest.

The preferred product rule is:

Allow the intended raise if another live player can legally contest it.

Do not silently reduce the bettor’s action before the sequence resolves.

Refund uncalled excess if no eligible opponent matches or contests it.

Example:

Player A bets 500.Player B all-in calls 400.No other player can contest the extra 100.The extra 100 is returned to Player A.The main pot includes only the matched 400 level from Player B.

This rule protects the game from “dead money” that no one had a fair chance to win.

8. Pots & Side Pots

Pots are not just one number. They are layers of matched contributions.

The UI may show one total pot for simplicity, but the backend must build pots by contribution level at showdown or whenever pot visibility is required.

Each pot must know:

its chip amount

which players are eligible to win it

the contribution threshold that created it

A player is eligible for a pot only if they contributed to that pot level and did not fold.

An all-in player can win only pots up to their all-in contribution level.

Side Pot Example

Player A all-in total contribution: 400Player B total contribution: 900Player C total contribution: 900

The pot structure becomes:

Main pot:400 from A + 400 from B + 400 from CEligible: A, B, CSide pot:500 from B + 500 from CEligible: B, C

If Player A has 21, Player A can win the main pot. Player A cannot win the side pot, because Player A did not contribute to the side pot level.

If Player B has 12 and Player C busts, Player B wins the side pot with 12. That may look strange to a player who only thinks in terms of the best table hand, but it is correct because the side pot only compares eligible side-pot players.

This is why showdown messaging must explain pot winners clearly. Players need to see not only who had the best hand, but who was eligible for which chips.

9. All-In Rules

All-in may happen in several ways:

a player calls short because they cannot cover the full amount

a player raises all remaining chips

a player calls exactly with all remaining chips

a blind or boot collection uses the player’s last chips

When a player goes all-in:

Their available chips become 0.

Their current contribution is locked.

Their pot eligibility is capped at that contribution.

They remain in the hand unless they later bust or the hand resolves.

They cannot perform chip-funded actions later.

They may still make Confirm/Stand card decisions when legal.

The key implementation challenge is avoiding accidental auto-fold behaviour.

An all-in player who cannot call a later raise should not be folded. They simply cannot contest the new side-pot layer. They remain eligible for the earlier pot levels they already contributed to.

For timeout behaviour, all-in card decisions should be treated differently from chip-funded betting decisions. If an all-in player times out while choosing Confirm or Stand, the default should be Confirm unless a table configuration explicitly says otherwise.

That timeout should be logged clearly so QA and support can see that the game performed an automatic all-in card decision, not a fold.

10. 21 Does Not Automatically End The Hand

This rule needs to be stated more than once because it is the easiest blackjack habit to accidentally import into 21 Hold’em.

Reaching 21 means the player has the strongest possible non-busting total. It does not mean the full table is resolved.

The hand may still need to continue because:

the player on 21 may only be eligible for the main pot

side pots may still exist

other players may still be contesting higher contribution levels

some players may have stood while others continue

later side pots may need separate winners

Example:

Player A is all-in for 400 and reaches 21.Player B and Player C each have 900 committed.

Player A’s 21 can win the main pot, but Player B and Player C must still resolve the 500-per-player side pot.

If the backend ends the hand immediately because Player A reached 21, Player B and Player C are denied a valid side-pot outcome.

A table-specific fast-win rule may exist only if it is explicitly documented and enabled for that table type. It should never be hidden default behaviour.

11. Check

Check is available only when the player is not facing a bet.

Checking means the player does not add chips and does not fold. It keeps the player in the hand at the current contribution level.

If another player later raises, the checking player must act again if they:

still have chips

have not folded

are eligible for the raised pot

are not all-in

This prevents the early checker from becoming accidentally immune to later betting.

A checked player returning to action should see real betting options, such as Call, Fold, or Raise where legal. They should not only see Confirm, because the situation has changed from a card decision to a chip decision.

12. Call

Call is available when the player is facing a bet and has enough chips to match it.

Calling adds the required chips and keeps the player eligible for the pot level they matched.

Calling does not automatically mean the player stands. Card intent and chip matching are separate decisions unless a specific UI flow deliberately combines them.

This matters because a player may call a bet and still want another community card. Another player may call and stand. The backend should represent those outcomes clearly instead of assuming every call carries the same card behaviour.

If the call is paired with a stand path, then the player also stops accepting further community cards. That combined behaviour should be explicit.

13. Fold

Fold means the player gives up all eligibility in the current hand.

A folded player cannot win any pot, even if their hand would later be strongest. Their chips already committed remain in the pot because those chips were risked before folding.

The backend should remove folded players from future card decisions and betting decisions.

A folded player’s cards may still be shown or hidden depending on product presentation, but mechanically the player is out.

All-in players should never be auto-folded merely because they cannot call a later raise. That is one of the most important differences between Fold and All-In.

14. Double Down

Double down is a special chip-funded action available only under configured table conditions.

The current product intent is:

double down is available only on the first community-card decision round

the player must have enough chips to pay the double-down amount

double down adds the configured amount

the player receives or accepts the relevant card

the player is then locked from taking further cards

Double down creates a high-risk commitment. The player increases their chip exposure in exchange for a fixed card outcome path.

Because double down requires more chips, it is not available to all-in players.

The backend should validate double down strictly. The frontend can advertise the button only when available, but the backend must still reject illegal double down requests.

15. Split

Split is a special action available only when the player’s private card and the relevant community card meet the configured split condition.

The current product intent is:

split is available only when exactly one community card has been dealt

the player’s hole card must match the community card label

the player must have enough chips to fund the split wager

split creates two hand tracks for that player

pot eligibility and card decisions must be tracked per split hand where required

Split is powerful because it turns one player position into multiple hand tracks. That means it can affect card acceptance, pot eligibility, UI display, and showdown explanation.

For that reason, split should not be treated as a small button addition. It needs its own detailed implementation spec before further code changes continue.

The split-specific spec should define:

how each split hand receives or rejects community cards

whether standing one split hand affects the other

how chip contribution is attached to each hand

how showdown displays multiple hands from one player

how side pots behave when split hands are involved

Until those rules are fully written, split should be considered a controlled feature rather than casual logic.

16. Turn Timing

Turn timing must distinguish between chip-funded decisions and non-chip card decisions.

If a normal player misses a chip-funded decision, the configured timeout behaviour applies. Depending on product settings, that may mean fold, check, or another default action.

For all-in Confirm/Stand decisions, timeout must not fold the player. The player has no chips left to wager, so the timeout is not a failure to defend a bet. It is only a missed card-control decision.

The recommended default for an all-in missed card decision is Confirm, unless table configuration explicitly says otherwise.

The backend should log automatic timeout actions clearly.

For bots, the rule is simple: bots must follow the same legal action rules as humans.

Bots must not bypass:

pot eligibility

all-in rules

side-pot rules

legal action validation

timeout sequencing

Bots are allowed to be fast. They are not allowed to be magic.

17. Showdown

Showdown is where the game proves whether the backend understood the hand.

The correct process is:

Build pots by contribution level.

For each pot, identify eligible non-folded players.

Remove bust hands from winning consideration for that pot.

Award the pot to the eligible player with the highest total at or below 21.

Split the pot evenly if multiple eligible players tie for best total.

Return or handle odd chips by configured table rule.

The important point is that showdown is not one comparison across the whole table. It is a sequence of comparisons, one per pot.

The showdown display should show enough information for players to trust the result:

each revealed hand

each player’s final total

which players were eligible for each pot

each pot winner

the amount each winner received

any refunded uncalled excess

A player losing a side pot with 21 would feel impossible unless the UI explains they were not eligible for that side pot. The result may be correct, but without explanation it will look broken.

18. UI Button Language

Button wording is part of the rules system. It is not just cosmetic.

Players learn the game through the buttons. If the buttons use vague wording, players misunderstand the rules and blame the game.

Use:

Confirm

Only when the player is confirming a card decision or pending action confirmation.

Use:

Call <amount>

When the player must add chips to continue contesting a pot.

Do not show Call <amount> to an all-in player. They cannot call because they have no chips left.

Do show Call <amount> to a player who previously confirmed, checked, or stood if another player later raises and the returning player has chips and remains eligible.

The UI should distinguish between:

Confirm = I accept the next card / confirm this non-chip stateCall = I add chips to match the current wagerStand = I stop taking cardsFold = I surrender my claimAll-In = I commit all remaining chips

This language should be consistent across desktop, mobile, tutorial, help copy, and VR/WebXR.

19. VR / WebXR Table Behaviour

For Operation VR and future 3D table interfaces, the VR table should not invent game logic.

The VR/WebXR client should behave like a beautiful physical presentation layer over the same backend rule engine.

The backend should provide:

current player state

legal actions

to-call amount

pot structure

player eligibility

hand totals when visible

card acceptance state

showdown result

refunded excess, if any

The VR/WebXR client should display:

cards

chips

player states

action buttons

betting zones

pot movement

winner flow

table prompts

showdown explanation

The reason for this separation is practical. A VR table has more presentation complexity than a flat UI: cameras, seats, controllers, ray pointers, 3D cards, chip animations, and table prompts. If it also starts guessing rules, bugs become much harder to trace.

The design principle is:

Backend decides.VR performs.

This lets the same legal-action system power desktop, mobile, and WebXR without rewriting the rules for each interface.

20. Known Implementation Gaps

These are not nice-to-have polish items. These are the gaps most likely to cause incorrect hand outcomes or confusing player decisions.

Required

Allow raises after one player is all-in when betting is still live between other players.

An all-in player should not freeze the hand for everyone else. If two or more eligible non-folded players still have chips, they may continue contesting side pots.

Build side pots from contribution levels instead of relying only on a single table pot.

A single pot number cannot correctly represent all-in eligibility. Side-pot logic must understand contribution layers.

Refund uncalled excess bets whenever no eligible opponent can contest the extra amount.

Chips that no one matched or could contest do not belong in the pot. They must be returned to the bettor under the configured rule.

Ensure a player who confirmed another community card can still be asked to call, fold, or raise after a later raise.

Confirm is not protection from future betting. If the betting situation changes, the player must return to a real decision when eligible.

Ensure all-in players are never asked to call later raises.

All-in players have no chips left. They can remain eligible for earlier pot levels, but they cannot call new wagers.

Stop declaring the entire hand finished because one player reaches 21.

21 is the best total, not an automatic full-hand resolver. Side pots and other eligible players may still need resolution.

Recommended Scenario Tests

Automated tests should cover:

Main pot plus side pot payout

Proves that all-in players can win the main pot while other players separately resolve the side pot.

Overbet refund

Proves that unmatched extra chips return to the bettor when no eligible player contests them.

Confirmed-then-raised player returns to betting

Proves that Confirm does not accidentally lock a player out of later required betting decisions.

All-in player receives Confirm/Stand but never Call

Proves that all-in players can still make card decisions but are not shown impossible chip actions.

Player reaches 21 while side pots remain unresolved

Proves that the backend does not end the hand too early.

Button labels across state changes

Proves the frontend displays the right language for all-in, call, confirm, stand, and raise-after-confirm states.

21. Glossary

Community Card

A shared card dealt to the table that may affect active player hands.

Community cards apply only to hands that are still accepting them. A player who has stood does not take future community cards for that hand.

Confirm

A player accepts the next community card or confirms the current pending action.

Confirm should not be used when the player must add chips. In that case, the correct language is Call, Raise, All-In, or Fold.

Stand

A player stops accepting further community cards for that hand.

Standing does not automatically remove the player from future betting obligations.

To Call

The chip amount required to match the current required contribution.

If the player cannot cover the full amount, the correct path may be all-in short rather than a normal call.

Main Pot

The pot every remaining eligible player can contest up to the smallest all-in contribution level.

Side Pot

An additional pot contested only by players who contributed above a lower all-in player’s level.

Side pots allow betting to continue fairly after one or more players are all-in.

Uncalled Excess

A bet amount that no eligible opponent matched or could contest.

Uncalled excess must be returned to the bettor under the configured rule.

Final Product Principle

21 Hold’em should feel fast, clean, and obvious at the table.

Under the hood, it must be strict.

Players should not need to understand every side-pot layer while playing casually, but the game must still resolve those layers correctly.

The player sees simple choices.

The backend enforces the law.

The table tells the truth.
