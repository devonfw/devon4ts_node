FROM debian:12-slim

ARG USERNAME=devon4ts
ARG USER_UID=1000
ARG USER_GID=$USER_UID

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/mise/shims:$PATH"

# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    #
    # [Optional] Add sudo support. Omit if you don't need to install software after connecting.
    && apt-get update \
    && apt-get -y --no-install-recommends install \
      sudo curl git ca-certificates build-essential \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME \
    && rm -rf /var/lib/apt/lists/*


RUN curl https://mise.run | sh \
  && mise install \
  && chown -R $USER_UID:$USER_GID $MISE_DATA_DIR

USER $USERNAME

CMD sleep infinity
