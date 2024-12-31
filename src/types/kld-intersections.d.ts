declare module 'kld-intersections' {
    export class Point2D {
        constructor(x: number, y: number);
        x: number;
        y: number;
    }

    export class Intersection {
        static intersectCircleLine(
            center: Point2D,
            radius: number,
            p1: Point2D,
            p2: Point2D
        ): { status: string; points: Point2D[] };

        static intersectLineRectangle(
            p1: Point2D,
            p2: Point2D,
            topLeft: Point2D,
            bottomRight: Point2D
        ): { status: string; points: Point2D[] };
    }
}