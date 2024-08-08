---
layout: post
title: 'How to Install GitLab Runner on Kubernetes'
description: 'Learn how to install Gitlab CI/CD Runner on Kubernetes and grant access to the Docker Daemon to build containers.'
canonical: https://adambcomer.com/blog/install-gitlab-runner-kubernetes/
author: 'Adam Comer'
updateDate: 2020-07-19T05:20:54+0000
createDate: 2019-02-02T02:57:00+0000
image: 'images/blog/post-1-cover.jpeg'
imageAlt: 'Gitlab logo on purple background'
---

Using [CI/CD Systems](https://en.wikipedia.org/wiki/Continuous_integration) to quickly build and deploy software has become the norm in professional software development and open source. Teams that use CI/CD Systems can build, test, and deploy every commit from their codebase. Along with CI/CD Systems, automated deployment and orchestration tools, like [Kubernetes](https://kubernetes.io/), have taken over data-centers with fully containerized workloads. A automated pipeline to build, test, and deploy your code is realizable by integrating a CI/CD System with Kubernetes. Building this system is easy with [Gitlab’s CI/CD Runner](https://docs.gitlab.com/ee/ci/) and [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine). In this tutorial, I will demonstrate how to set up Gitlab’s CI/CD System and launch it on a Kubernetes cluster — for releases that are 100% automated.

**Note:** When setting up the runner for myself, I wanted complete control over the resources deployed on my cluster. To reflect this, this guide exhibits how to manually install the Runner on Kubernetes without using Helm, like the [official guide](https://docs.gitlab.com/runner/install/kubernetes.html). The final result is functionally equivalent but without the extra tooling.

## Register a Runner

The first step to deploying a Gitlab Runner on Kubernetes is to obtain a registration token from Gitlab. This token is necessary because it create a new authentication token that connects the Runner to Gitlab.

First, we need to request a new registration token from Gitlab. Head to your online Gitlab repository and go to **Settings > CI/CD > Runners**. Then, find the section titled: Set up a specific Runner manually. This page hosts the details we need to register a new Runner with Gitlab. The registration token we are looking for will be automatically generated under the third item in the list.

Next, we need to go through the registration process to connect a new Runner. We will use the registration details we obtained from Gitlab to complete this step. The easiest way to register a Runner is to start a [Docker](https://docs.docker.com/engine/docker-overview/) container locally with the Runner. Don’t worry about keeping this container in perfect condition because we will discard it after the registration process. Our goal is to start a terminal within the container to perform the registration process. Using Docker, we can start a terminal with this command.

```console
$ docker run -it --entrypoint /bin/bash gitlab/gitlab-runner:latest
```

Next, we can register the Runner with this command.

```console
$ gitlab-runner register
```

Here is where we take the registration information we got from the Gitlab repository and use it to register a new Runner. Using the provided information, complete the form as follows. Replace **[REGISTRATION TOKEN]** with your registration token.

```console
Please enter the gitlab-ci coordinator URL (e.g. https://gitlab.com/):
https://gitlab.com/

Please enter the gitlab-ci token for this runner:
[REGISTRATION TOKEN]

Please enter the gitlab-ci description for this runner:
[RUNNER-ID]: My first Gitlab runner!

Please enter the gitlab-ci tags for this runner (comma separated):
tutorial

Whether to lock the Runner to current project [true/false]:
[true]: false

Registering runner... succeeded                     runner=[RUNNER ID]

Please enter the executor: shell, ssh, docker+machine, docker-ssh+machine, kubernetes, docker, docker-ssh, parallels, virtualbox:
docker

Please enter the default Docker image (e.g. ruby:2.1):
busybox:latest

Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!
```

Don’t worry about the executor details or the default image for the Docker executor. Later, we will use a Kubernetes executor along with a different configuration when we ultimately deploy the Runner.
To check if the registration was successful, return to your browser, and refresh the page. Under the registration information will be the new Runner. This Runner **should be disconnected with an error.**

The final step is to extract the authentication token from the local Runner. When we registered the Runner, Gitlab saved an authentication token in the docker container. Before launching the runner to Kubernetes, we need to get this authentication token.

This token is necessary because it connects your Runner to Gitlab and designates a stable ID for your Runner. When Pods are restarted automatically by Kubernetes, a stable ID allows Gitlab to reference the same logical Runner after each restart.

To find the authentication token, we need to open the generated configuration file from the registration process. In the terminal, run this command to view the configuration.

```console
$ vim /etc/gitlab-runner/config.toml

concurrent = 1
check_interval = 0

[[runners]]
  name = "temp runner"
  url = "https://gitlab.com/"
  token = [TOKEN]
  executor = "docker"
  [runners.docker]
    tls_verify = false
    image = "busybox:latest"
    privileged = false
    disable_cache = false
    volumes = ["/cache"]
    shm_size = 0
  [runners.cache]
```

Above is the configuration that Gitlab created when we registered the runner. I redacted my token for security purposes and renamed it to **[TOKEN]**. Copy this token and make sure not to lose it, as it is the only way to authenticate the newly registered Runner to Gitlab. Once properly stored, it is safe to shutdown and remove the Docker instance.

## Deploy the Runner to Kubernetes

After we have an authentication token, we can start work on deploying the Runner to Kubernetes. I’m running the cluster for this tutorial on [GKE](https://cloud.google.com/kubernetes-engine), but this will work with any Kubernetes cluster hosted by the other major cloud providers ([AWS EKS](https://aws.amazon.com/eks/), [Azure AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/), or [IBM Kubernetes Service](https://www.ibm.com/cloud/container-service/)).

Before we add the Runner to the cluster, we must create a few resources on the Kubernetes cluster. The first is a [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) for the Runner and its Pods. The Namespace separates the Runner from other applications to aid with future upgrades and maintenance. The second is a [ServiceAccount, Role, and RoleBinding](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) to give the Runner the privileges to add new Pods to the Namespace.

First, declare a new Namespace called gitlab-runner.

```console
$ kubectl create namespace gitlab-runner
```

After we create the new Namespace, we add the authentication roles to the Kubernetes cluster for the Runner. Below are the ServiceAccount, Role, and RoleBinding for the Runner. Copy this configuration into a file called `gitlab-runner-service-account.yaml`, and deploy it with `kubectl`.

```yaml
# gitlab-runner-service-account.yaml

apiVersion: v1
kind: ServiceAccount
metadata:
  name: gitlab-admin
  namespace: gitlab-runner
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  namespace: gitlab-runner
  name: gitlab-admin
rules:
  - apiGroups: ['']
    resources: ['*']
    verbs: ['*']

---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: gitlab-admin
  namespace: gitlab-runner
subjects:
  - kind: ServiceAccount
    name: gitlab-admin
    namespace: gitlab-runner
roleRef:
  kind: Role
  name: gitlab-admin
  apiGroup: rbac.authorization.k8s.io
```

```console
$ kubectl apply -f gitlab-runner-service-account.yaml
```

This ServiceAccount gives the runner access to create, modify, and view other Pods in the cluster. Use with caution. For organizations that are concerned about the access the Runner will have, it is common to use a separate cluster for CI/CD related business. An independent cluster will reduce the attack surface of your cluster with minimal incurred cloud costs.

Once the ServiceAccount, Role, and RoleBinding are deployed to the cluster, a ConfigMap is needed to hold the Runner’s configuration. The Runner’s [ConfigMap](https://cloud.google.com/kubernetes-engine/docs/concepts/configmap) is very similar to the Runner configuration that Gitlab created for the authentication token but with some Kubernetes specific changes. Take the authentication token that was created in the last section, and add it the ConfigMap in the section with **[TOKEN]**.

```yaml
# gitlab-runner-config.yaml

apiVersion: v1
kind: ConfigMap
metadata:
  name: gitlab-runner-config
  namespace: gitlab-runner
data:
  config.toml: |-
    concurrent = 4
    [[runners]]
      name = "Kubernetes Demo Runner"
      url = "https://gitlab.com/ci"
      token = "[TOKEN]"
      executor = "kubernetes"
      [runners.kubernetes]
        namespace = "gitlab-runner"
        poll_timeout = 600
        cpu_request = "1"
        service_cpu_request = "200m"
```

Add this ConfigMap to the Kubernetes cluster.

```console
$ kubectl apply -f gitlab-runner-config.yaml
```

This configuration is slightly different from the one that was generated by Gitlab when we registered the Runner. Note that the executor is Kubernetes executor, not a Docker executor like before. A Kubernetes executor runs each pipeline stage in a new Pod. By running a new Pod for each stage, the testing and build environments are fresh for each pipeline. Additionally, this allows the Runner to scale by delegating Kubernetes to manage all of the running Pods. The Runner doesn’t have to manage a bunch of Docker containers and is only concerned with collecting the results from each run.

The final thing to create is a [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) for the Runner. This Deployment is very straightforward because the Kubernetes executor on the Runner handles packaging each pipeline into a new Pod. Since autoscaling is handled on the executor level, Pod autoscaling is not needed for the Runner. To connect the new Runner to Gitlab, we need to integrate the ConfigMap we created above. By attaching the ConfigMap as a volume to the Pod, the Runner can safely be restarted and updated while maintaining the same configuration. Add the Deployment to the Kubernetes cluster.

```yaml
# gitlab-runner-deployment.yaml

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: gitlab-runner
  namespace: gitlab-runner
spec:
  replicas: 1
  selector:
    matchLabels:
      name: gitlab-runner
  template:
    metadata:
      labels:
        name: gitlab-runner
    spec:
      serviceAccountName: gitlab-admin
      containers:
        - args:
            - run
          image: gitlab/gitlab-runner:latest
          imagePullPolicy: Always
          name: gitlab-runner
          resources:
            requests:
              cpu: '100m'
            limits:
              cpu: '100m'
          volumeMounts:
            - name: config
              mountPath: /etc/gitlab-runner/config.toml
              readOnly: true
              subPath: config.toml
      volumes:
        - name: config
          configMap:
            name: gitlab-runner-config
      restartPolicy: Always
```

```console
$ kubectl apply -f gitlab-runner-deployment.yaml
```

To check if the runner connected to Gitlab, head back to your browser, and refresh your repository’s settings. The Runner will have a green dot next to its name to identify that the it has connected to Gitlab. Often, there is a delay of a minute or two for the runner to connect (this happened to me).

Now that the Runner is connected, you can run CI/CD pipelines from your repository. The Runner can do things like build GO binaries and deploy websites to S3. Although the Runner can do a lot, it has one major limitation: its inability to build Docker containers. In the next section, I will walk you through enabling Docker builds on the Runner.

## Enable Docker Builds

To enable the Runner to build Docker containers, we must give the Runner access to the local Docker daemon. Normally, Docker and Kubernetes block access to the local Docker daemon because of the security implications. For a Runner to access the daemon, it will need to run in [privileged mode](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) to get this access. As a warning, running containers in privileged mode with other production containers is not recommended. To use privileged mode in the safest way possible, [security professionals recommend isolating CI/CD resources in another cluster](https://jpetazzo.github.io/2015/09/03/do-not-use-docker-in-docker-for-ci/).

To enable building Docker containers directly inside the CI/CD pipeline, we need to update the ConfigMap to allow access to the local Docker daemon and run the Pods in privileged mode. Change the ConfigMap to reflect the changes as such.

```yaml
# gitlab-runner-config.yaml

apiVersion: v1
kind: ConfigMap
metadata:
  name: gitlab-runner-config
  namespace: gitlab-runner
data:
  config.toml: |-
    concurrent = 4
    [[runners]]
      name = "Kubernetes Runner"
      url = "https://gitlab.com/ci"
      token = "[TOKEN]"
      executor = "kubernetes"
      [runners.kubernetes]
        namespace = "gitlab-runner"
        privileged = true
        poll_timeout = 600
        cpu_request = "1"
        service_cpu_request = "200m"
        [[runners.kubernetes.volumes.host_path]]
            name = "docker"
            mount_path = "/var/run/docker.sock"
            host_path = "/var/run/docker.sock"
```

```console
$ kubectl apply -f gitlab-runner-config.yaml
```

After the ConfigMap is updated, restart the Runner Pod; it will update with the new ConfigMap. Once completed, we can enable the `docker:dind` service in the CI/CD pipeline and build docker containers from directly within the CI/CD pipelines. This opens up the possibility of fully automated Kubernetes deployments. Now, you can build and deploy the containers produced by the Runner directly to the Kubernetes cluster.

## Conclusion

We can see that setting up Gitlab’s CI/CD Runner on Kubernetes isn’t very difficult to do. With a registration token from Gitlab, we can easily authorize a new Runner. Next, a simple ConfigMap and Deployment are used to launch the Runner to the Kubernetes cluster. By using a Kubernetes executer on the Runner, pipelines can be auto-scaled across the cluster as demand for your Runner increases. Although the base Runner is powerful, connecting the Docker daemon to the Runner allows it to build Docker containers. Once the Runner is up and running, we can execute CI/CD pipelines and deploy the builds on a Kubernetes cluster — all 100% automated.
