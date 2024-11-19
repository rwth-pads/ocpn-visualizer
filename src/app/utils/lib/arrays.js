/**
 * Deep clones a 2D array (array of arrays).
 * 
 * @param {Array<Array<String>>} arr The array to clone.
 * @returns The cloned array.
 */
function clone2DArray(arr) {
    return arr.map(innerArr => innerArr.slice());
}

/**
 * Compares two 2D arrays for deep equality.
 * 
 * @param {Array<Array<String>>} arr1 - The first 2D array.
 * @param {Array<Array<String>>} arr2 - The second 2D array.
 * @returns {boolean} - True if the arrays are equal, false otherwise.
 */
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].length !== arr2[i].length) return false;
        for (let j = 0; j < arr1[i].length; j++) {
            if (arr1[i][j] !== arr2[i][j]) return false;
        }
    }
    return true;
}

module.exports = {
    clone2DArray,
    arraysEqual
};

// export default {
//     clone2DArray,
//     arraysEqual
// };
