module.exports = {
    init: function (elevators, floors) {

        let orders = [];

        floors.forEach(floor => {
            floor.on("up_button_pressed", () => orders.push({ floorNum: floor.floorNum(), direction: "up" }))
            floor.on("down_button_pressed", () => orders.push({ floorNum: floor.floorNum(), direction: "down" }))
        })

        for (let elevator of elevators) {

            let timer;
            let pressed = []
            let currentOrder;

            elevator.on("idle", () => {
                // elevator.goingDownIndicator(true)
                // elevator.goingUpIndicator(true)
                timer = setInterval(() => {
                    let floorNum;
                    if (pressed.length > 0) {
                        floorNum = pressed.shift().floorNum;
                    }
                    else if (orders.length > 0) {
                        currentOrder = orders.shift()
                        floorNum = currentOrder.floorNum;
                    }
                    else { return; }

                    elevator.goToFloor(floorNum)
                    const direction = elevator.currentFloor() < floorNum ? "up" : "down";
                    // elevator.goingDownIndicator(direction === "down")
                    // elevator.goingUpIndicator(direction === "up")
                    if (timer) clearInterval(timer)
                }, 1)
            })

            elevator.on("floor_button_pressed", floorNum => {
                //const next = elevator.destinationQueue[elevator.destinationQueue - 1];
                const direction = elevator.currentFloor() > floorNum ? "down" : "up";
                pressed.push({ floorNum, direction })
                // elevator.goToFloor(floorNum)
            })

            elevator.on("stopped_at_floor", floorNum => {
                pressed = pressed.filter(x => x.floorNum !== floorNum)
                if (currentOrder != null) {
                    const { direction } = currentOrder;
                    elevator.goingDownIndicator(direction === "down")
                    elevator.goingUpIndicator(direction === "up")
                    currentOrder = null;
                }


                // const nextFloorNum = elevator.destinationQueue[0] || 0
                // const direction = nextFloorNum > floorNum ? "up" : "down";
                // elevator.goingDownIndicator(direction === "down")
                // elevator.goingUpIndicator(direction === "up")
                elevator.goingDownIndicator(elevator.currentFloor() === floors.length - 1)
                elevator.goingUpIndicator(elevator.currentFloor() === 0)
            })

            elevator.on("passing_floor", (floorNum, direction) => {
                let index;
                index = pressed.findIndex(order => order.floorNum === floorNum)
                if (index > -1) {
                    elevator.goToFloor(pressed[index].floorNum, true)
                    pressed.splice(index, 1)
                    return;
                }

                index = orders.findIndex(order => order.floorNum === floorNum && order.direction === direction)
                if (index > -1) {
                    elevator.goToFloor(orders[index].floorNum, true)
                    orders.splice(index, 1)
                }
            })
        }
    },
    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}