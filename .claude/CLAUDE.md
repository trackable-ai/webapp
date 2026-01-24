# Claude Notes

## Git Commits

Avoid using heredoc syntax (`<<'EOF'`) for commit messages - the sandbox blocks temp file creation outside `/tmp/claude/`. Use simple quoted strings instead:

```bash
# Don't do this
git commit -m "$(cat <<'EOF'
message
EOF
)"

# Do this
git commit -m "message"
```
