import * as output from './presentation/output';
import * as menu from './presentation/menu';

const main = async (): Promise<void> => {
  try {
    output.showBanner();
    output.showWelcome();
    await menu.startMenu();
  } catch (error) {
    output.showError('Ocurrió un error inesperado');
    process.exit(1);
  }
};

main();
