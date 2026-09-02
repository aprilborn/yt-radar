/**
 * A background that needs elements of its own rather than just a class.
 * BgDirective builds one when its type is selected and destroys it when the
 * user switches away, so an implementation only has to be able to undo itself.
 */
export interface BgAnimation {
  destroy(): void;
}
