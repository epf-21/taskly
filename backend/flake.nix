{
  description = "mockup-sgaf-back dev shell";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-26.05";

  outputs =
    { nixpkgs, ... }:
    let
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
    in
    {
      devShells.x86_64-linux.default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_24
          bun
          prisma-engines_7
          openssl
        ];

        env = {
          PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines_7}/bin/schema-engine";
        };
      };
    };
}
