export 
function xor_cipher(input, key) {
    let result = "";
    let input_length = input.length;
    let key_length = key.length;
    for (let i = 0; i < input_length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key_length));
    }
    return result;
}
