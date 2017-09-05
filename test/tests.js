export default [
  {
    message: 'should not parse C++ code without JSX',
    input: `
      // my first program in C++
      #include <iostream>
      
      int main()
      {
        std::cout << "Hello World!";
      }
    `,
    output: `
      // my first program in C++
      #include <iostream>
      
      int main()
      {
        std::cout << "Hello World!";
      }
    `,
  },
];
