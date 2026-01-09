// apps/web/remove-console.js
// Babel plugin to remove console.log, console.warn, and console.info in production
// while preserving console.error for critical error tracking

module.exports = function ({ types: t }) {
  return {
    name: 'remove-console',
    visitor: {
      CallExpression(path) {
        const callee = path.get('callee');
        
        // Check if it's a console method call
        if (!callee.isMemberExpression()) return;
        
        const object = callee.get('object');
        const property = callee.get('property');
        
        // Check if it's console.log, console.warn, or console.info
        if (
          object.isIdentifier({ name: 'console' }) &&
          property.isIdentifier() &&
          ['log', 'warn', 'info'].includes(property.node.name)
        ) {
          // Remove the entire statement
          path.remove();
        }
      },
    },
  };
};
