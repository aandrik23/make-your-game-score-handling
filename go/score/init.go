package score

// Init loads/creates the scoreboard and stores it in the package-global variable.
func Init(path string) error {
	sb, err := NewScoreboard(path)
	if err != nil {
		return err
	}
	scoreboard = sb
	return nil
}
