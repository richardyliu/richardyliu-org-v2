/**
 * Shared chrome state: the menu overlay, the Find overlay, and whether the
 * header is currently pinned.
 *
 * A module-level rune object rather than a store because these are read from
 * markup in several sibling components and never need subscription plumbing.
 * Menu and Find are mutually exclusive — opening either closes the other, which
 * is enforced here instead of at each call site.
 */

class UiState {
  menuOpen = $state(false);
  findOpen = $state(false);
  /** True while the mobile header is showing; false once it has slid away. */
  headerPinned = $state(true);

  openMenu() {
    this.findOpen = false;
    this.menuOpen = true;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  toggleMenu() {
    this.menuOpen ? this.closeMenu() : this.openMenu();
  }

  openFind() {
    this.menuOpen = false;
    this.findOpen = true;
  }

  closeFind() {
    this.findOpen = false;
  }

  toggleFind() {
    this.findOpen ? this.closeFind() : this.openFind();
  }

  closeAll() {
    this.menuOpen = false;
    this.findOpen = false;
  }

  get anyOpen() {
    return this.menuOpen || this.findOpen;
  }
}

export const ui = new UiState();
