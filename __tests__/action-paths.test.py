from pathlib import Path
import os
import re
import subprocess
import tempfile
import unittest


class ActionPathTest(unittest.TestCase):
    def test_action_references_resolve_inside_the_action(self):
        root = Path(__file__).resolve().parents[1]
        text = (root / "action.yml").read_text(encoding="utf-8")

        scripts = (
            "playground-ping.sh",
            "manifest-merger.sh",
            "uploadApplicationFile.sh",
            "uploadApplicationUrl.sh",
            "sendSnapshotEmail.sh",
        )
        for script in scripts:
            with self.subTest(script=script):
                self.assertIn(
                    "${{ github.action_path }}/" + script,
                    text,
                    f"{script} is not referenced from github.action_path",
                )
                self.assertTrue((root / script).is_file(), f"missing action script: {script}")

        directories = (
            "cypress-action",
            "node-file-upload",
        )
        for directory in directories:
            with self.subTest(directory=directory):
                self.assertRegex(
                    text,
                    re.compile(r"working-directory:\s*\$\{\{ github\.action_path \}\}/" + directory),
                    f"working directory for {directory} is not action-relative",
                )
                self.assertTrue((root / directory).is_dir(), f"missing action directory: {directory}")

        artifact_paths = (
            "log.txt",
            "cypress-action/cypress/videos",
            "cypress-action/cypress/screenshots",
        )
        for path in artifact_paths:
            with self.subTest(artifact=path):
                self.assertIn(
                    "path: ${{ github.action_path }}/" + path,
                    text,
                    f"artifact path {path} is not action-relative",
                )
                # Cypress output folders and log.txt are created during action execution.
                target = root / path
                ancestor = target.parent
                while not ancestor.exists() and ancestor != root:
                    ancestor = ancestor.parent
                self.assertEqual(ancestor, root if path == "log.txt" else root / "cypress-action" / "cypress")

    def test_upload_helper_resolves_its_normalizer_from_its_directory(self):
        root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            caller_workspace = Path(temporary_directory)
            fake_bin = caller_workspace / "bin"
            fake_bin.mkdir()
            (caller_workspace / "__intermediate_file.yml").write_text("kind: Pod\n", encoding="utf-8")

            node_args = caller_workspace / "node-args.txt"
            node = fake_bin / "node"
            node.write_text(
                "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"$NODE_ARGS_FILE\"\nprintf 'encoded-pattern\\n'\n",
                encoding="utf-8",
            )
            node.chmod(0o755)
            curl = fake_bin / "curl"
            curl.write_text("#!/bin/sh\nprintf '[{\\\"id\\\":\\\"design-id\\\"}]'\n", encoding="utf-8")
            curl.chmod(0o755)
            jq = fake_bin / "jq"
            jq.write_text("#!/bin/sh\ncat >/dev/null\nprintf 'design-id\\n'\n", encoding="utf-8")
            jq.chmod(0o755)

            environment = os.environ.copy()
            environment.update(
                {
                    "PATH": str(fake_bin) + os.pathsep + environment["PATH"],
                    "NODE_ARGS_FILE": str(node_args),
                    "MESHERY_SERVER_BASE_URL": "http://localhost",
                    "MESHERY_TOKEN": "synthetic-token",
                }
            )
            result = subprocess.run(
                ["bash", str(root / "uploadApplicationFile.sh")],
                cwd=caller_workspace,
                env=environment,
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            helper_path = Path(node_args.read_text(encoding="utf-8").splitlines()[0])
            self.assertEqual(
                helper_path.resolve(),
                (root / "normalize-configuration-file" / "index.js").resolve(),
            )


if __name__ == "__main__":
    unittest.main()
