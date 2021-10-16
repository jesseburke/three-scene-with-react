module.exports = {
    mode: 'jit',
    purge: ['./**/*.html', './**/*.js', './**/*.tsx', './**/*.jsx', './**/*.ts'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        screens: {
            sm: '400px',
            md: '661px',
            lg: '768px',
            xl: '1280px',
            '2xl': '1536px'
        },
        extend: {
            colors: {
                persian_blue: {
                    50: '#d8e7e8',
                    100: '#b6cfd4',
                    200: '#95b8c1',
                    300: '#76a0af',
                    400: '#57899e',
                    500: '#38728e',
                    600: '#165b7b',
                    700: '#004563',
                    800: '#002f4b',
                    900: '#001a34'
                }
            }
        }
    },
    plugins: []
};
