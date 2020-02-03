module.exports = {
    init: function (elevators, floors) {

        let orders = new Set()
        const sep = "."

        const sendElevatorToFloorIfNotOtherElevatorGoes = (elevator, floor, direction) => {
            if (!orders.has(floor.floorNum() + sep + "up") && !orders.has(floor.floorNum() + sep + "down")) {
                orders.add(floor.floorNum() + sep + direction)
                elevator.goToFloor(floor.floorNum())
            }
        }

        for (let elevator of elevators) {

            floors.forEach(floor => {
                floor.on("up_button_pressed", () => sendElevatorToFloorIfNotOtherElevatorGoes(elevator, floor, "up"))
                floor.on("down_button_pressed", () => sendElevatorToFloorIfNotOtherElevatorGoes(elevator, floor, "down"))
            })

            elevator.on("idle", () => {
                //if(orders.size < 1) return;
                //let [floorNum, direction] = [...orders].pop().split(sep)
                //elevator.goToFloor(floorNum)
            })

            elevator.on("floor_button_pressed", floorNum => {
                const direction = elevator.destinationQueue[elevator.destinationQueue - 1] > floorNum ? "down" : "up";
                orders.add(floorNum + sep + direction)
                elevator.goToFloor(floorNum)
            })

            elevator.on("stopped_at_floor", floorNum => {
                const nextFloorNum = elevator.destinationQueue[0] || 0
                if (nextFloorNum < floorNum)
                    orders.delete(floorNum + sep + "down")
                else
                    orders.delete(floorNum + sep + "up")
            })

            elevator.on("passing_floor", (floorNum, direction) => {
                if (orders.has(floorNum + sep + direction)) {
                    elevator.goToFloor(floorNum, true)
                }

            })
        }
    },
    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}