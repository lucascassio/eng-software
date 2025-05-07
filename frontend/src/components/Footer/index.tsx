import styles from './styles.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p>Sistema de Troca de Livros - UFMG</p>
        <p>© {new Date().getFullYear()} Todos os direitos reservados</p>
      </div>
    </footer>
  );
}