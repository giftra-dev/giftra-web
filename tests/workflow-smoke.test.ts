import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { canTransitionOrder, getChatWorkflowState, isChatLocked } from "@/lib/giftra/state-machine"

describe("Giftra workflow smoke tests", () => {
  it("allows paid orders to move into production", () => {
    assert.equal(canTransitionOrder("awaiting_payment", "in_progress"), true)
  })

  it("keeps chat available for active request discussion", () => {
    const state = getChatWorkflowState({
      requestStatus: "artist_assigned",
      orderStatus: null,
    })

    assert.equal(isChatLocked(state), false)
  })
})
