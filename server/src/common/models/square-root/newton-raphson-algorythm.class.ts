import { SqrtAlgorithm } from "./sqrt-algorythm.a-class";

// Implementation of the Newton-Raphson algorithm: x(n+1) = 0.5 * (x(n) + number/x(n))
// 1. Start with an initial guess
// 2. Update the guess by averaging it with the number divided by the guess
// 3. Repeat step 2 until the guess is within the tolerance
// 4. Return the guess

export class NewtonRaphsonAlgorithm extends SqrtAlgorithm {
    private guess = 0;

    setTarget(number: number): void {
        super.setTarget(number);

        //Start guess from half of the input value or 1 if input is 1 
        this.guess = this.number >= 1 ? this.number / 2 : 1;
        this.result = this.guess;
    }

    process(): number {
        // Return 0 for non-positive numbers (square root is not defined for negative numbers)
        if (this.number <= 0) {
            return 0;
        }
        // Use the parent implementation for positive numbers
        return super.process();
    }

    protected approximateGuess(): number {
        this.guess = 0.5 * (this.guess + this.number / this.guess);
        return this.guess;
    }
}
